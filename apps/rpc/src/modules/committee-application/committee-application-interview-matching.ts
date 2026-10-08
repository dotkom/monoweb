import { tz } from "@date-fns/tz"
import {
  addMilliseconds,
  addMinutes,
  areIntervalsOverlapping,
  compareAsc,
  differenceInMilliseconds,
  format,
  getTime,
  hoursToMilliseconds,
  isAfter,
  isBefore,
  max,
  min,
  minutesToMilliseconds,
  parseISO,
  startOfDay,
  toDate,
} from "date-fns"
import loadHighs from "highs"
import { IllegalStateError, InvalidArgumentError } from "../../error"
import {
  type CommitteeApplicationInterviewMatchingInput,
  CommitteeApplicationInterviewMatchingInputSchema,
  type CommitteeApplicationInterviewMatchingResult,
} from "./committee-application"

const APPLICANT_BUFFER_MINUTES = 15
const CLUSTERING_BASELINE = parseISO("1970-01-01T12:00:00Z")
const CLUSTERING_SCALE_MILLISECONDS = hoursToMilliseconds(12)
const SHORT_NOTICE_THRESHOLD_MILLISECONDS = hoursToMilliseconds(24)
const SHORT_NOTICE_DECAY_MILLISECONDS = hoursToMilliseconds(12)
const PREFERENCE_PENALTY_TOLERANCE = 1e-7
const dateContext = { in: tz("UTC") }
const interviewDateContext = { in: tz("Europe/Oslo") }

interface Interval {
  startsAt: Date
  endsAt: Date
}

interface InterviewSlot extends Interval {
  applicationGroupId: string
  blocksByRoom: Map<string, string>
  candidateIndexes: number[]
}

interface Candidate {
  variableName: string
  applicationId: string
  groupSelectionId: string
  interviewBlockId: string
  roomName: string
  slot: InterviewSlot
}

let solverPromise: ReturnType<typeof loadHighs> | undefined

function mergeAvailability(intervals: Interval[]): Interval[] {
  const mergedIntervals: Interval[] = []

  for (const interval of intervals.toSorted((first, second) => compareAsc(first.startsAt, second.startsAt))) {
    const previousInterval = mergedIntervals.at(-1)

    if (previousInterval !== undefined && !isAfter(interval.startsAt, previousInterval.endsAt)) {
      previousInterval.endsAt = max([previousInterval.endsAt, interval.endsAt])
    } else {
      mergedIntervals.push({ ...interval })
    }
  }

  return mergedIntervals
}

function timeOnBaselineDay(date: Date): Date {
  return addMilliseconds(
    startOfDay(CLUSTERING_BASELINE, dateContext),
    differenceInMilliseconds(date, startOfDay(date, dateContext))
  )
}

function slotsConflict(first: Interval, second: Interval): boolean {
  return areIntervalsOverlapping(
    {
      start: first.startsAt,
      end: addMinutes(first.endsAt, APPLICANT_BUFFER_MINUTES),
    },
    {
      start: second.startsAt,
      end: addMinutes(second.endsAt, APPLICANT_BUFFER_MINUTES),
    }
  )
}

export async function matchCommitteeApplicationInterviews(
  input: CommitteeApplicationInterviewMatchingInput
): Promise<CommitteeApplicationInterviewMatchingResult> {
  const data = CommitteeApplicationInterviewMatchingInputSchema.parse(input)
  const slotsByGroup = new Map<string, InterviewSlot[]>()

  for (const group of data.groups) {
    let durationMinutes = 20

    if (group.interviewDuration === "MINUTES_30") {
      durationMinutes = 30
    }

    const slotsByInterval = new Map<string, InterviewSlot>()

    for (const block of data.interviewBlocks.filter(
      (interviewBlock) => interviewBlock.applicationGroupId === group.id
    )) {
      for (
        let startsAt = block.startsAt;
        !isAfter(addMinutes(startsAt, durationMinutes), block.endsAt);
        startsAt = addMinutes(startsAt, durationMinutes)
      ) {
        const endsAt = addMinutes(startsAt, durationMinutes)
        const intervalKey = `${getTime(startsAt)}:${getTime(endsAt)}`
        let slot = slotsByInterval.get(intervalKey)

        if (slot === undefined) {
          slot = { startsAt, endsAt, applicationGroupId: group.id, blocksByRoom: new Map(), candidateIndexes: [] }
          slotsByInterval.set(intervalKey, slot)
        }

        // The original model counts distinct room names, rather than availability records.
        if (!slot.blocksByRoom.has(block.locationName)) {
          slot.blocksByRoom.set(block.locationName, block.id)
        }
      }
    }

    slotsByGroup.set(group.id, [...slotsByInterval.values()])
  }

  const candidates: Candidate[] = []
  const candidatesBySelection = new Map<string, number[]>()
  const slotsByApplication = new Map<string, Map<InterviewSlot, number[]>>()
  const applicationIds = new Set(data.applications.map((application) => application.id))

  for (const selection of data.groupSelections) {
    const groupSlots = slotsByGroup.get(selection.applicationGroupId)

    if (!applicationIds.has(selection.applicationId) || groupSlots === undefined) {
      throw new InvalidArgumentError(`GroupSelection(ID=${selection.id}) references an unknown application or group`)
    }

    const availability = mergeAvailability(
      data.availabilityBlocks
        .filter((block) => block.applicationId === selection.applicationId)
        .map((block) => ({ startsAt: block.startsAt, endsAt: block.endsAt }))
    )

    const selectionCandidateIndexes: number[] = []
    const applicationSlots = slotsByApplication.get(selection.applicationId) ?? new Map<InterviewSlot, number[]>()

    slotsByApplication.set(selection.applicationId, applicationSlots)

    for (const slot of groupSlots) {
      if (
        !availability.some(
          (interval) => !isBefore(slot.startsAt, interval.startsAt) && !isAfter(slot.endsAt, interval.endsAt)
        )
      ) {
        continue
      }

      const slotCandidateIndexes: number[] = []

      for (const [roomName, interviewBlockId] of slot.blocksByRoom) {
        // Room choices have identical coefficients, but each contributes to the original weight denominator.
        const candidateIndex = candidates.length
        candidates.push({
          variableName: `assignment_${candidateIndex}`,
          applicationId: selection.applicationId,
          groupSelectionId: selection.id,
          interviewBlockId,
          roomName,
          slot,
        })
        selectionCandidateIndexes.push(candidateIndex)
        slot.candidateIndexes.push(candidateIndex)
        slotCandidateIndexes.push(candidateIndex)
      }

      applicationSlots.set(slot, slotCandidateIndexes)
    }

    candidatesBySelection.set(selection.id, selectionCandidateIndexes)
  }

  if (candidates.length === 0) {
    return {
      solverStatus: "OPTIMAL",
      objectiveValue: 0,
      totalWantedInterviews: data.groupSelections.length,
      matchedInterviews: 0,
      interviews: [],
    }
  }

  const clusteringWeight = 1 / candidates.length
  const preferencePenalties = candidates.map((candidate) => {
    const startTime = timeOnBaselineDay(candidate.slot.startsAt)
    const endTime = addMilliseconds(startTime, differenceInMilliseconds(candidate.slot.endsAt, candidate.slot.startsAt))
    let baselineDistance = 0

    if (isBefore(endTime, CLUSTERING_BASELINE)) {
      baselineDistance = differenceInMilliseconds(CLUSTERING_BASELINE, endTime)
    } else if (isAfter(startTime, CLUSTERING_BASELINE)) {
      baselineDistance = differenceInMilliseconds(startTime, CLUSTERING_BASELINE)
    }

    const noticeMilliseconds = Math.max(
      0,
      differenceInMilliseconds(candidate.slot.startsAt, data.interviewsPublishedAt)
    )
    let shortNoticePenalty = 0

    if (noticeMilliseconds < SHORT_NOTICE_THRESHOLD_MILLISECONDS) {
      // Normalize the exponential to one at publication and zero at 24 hours, without a cutoff jump.
      shortNoticePenalty =
        Math.expm1((SHORT_NOTICE_THRESHOLD_MILLISECONDS - noticeMilliseconds) / SHORT_NOTICE_DECAY_MILLISECONDS) /
        Math.expm1(SHORT_NOTICE_THRESHOLD_MILLISECONDS / SHORT_NOTICE_DECAY_MILLISECONDS)
      // During short notice, prioritize preparation time rather than pulling interviews toward noon.
      baselineDistance = 0
    }

    return { shortNoticePenalty, clusteringPenalty: baselineDistance / CLUSTERING_SCALE_MILLISECONDS }
  })

  const objectiveTerms = candidates.map((candidate, candidateIndex) => {
    const penalties = preferencePenalties[candidateIndex]
    const coefficient = 1 - clusteringWeight * (penalties.clusteringPenalty + penalties.shortNoticePenalty)

    if (coefficient < 0) {
      return `- ${Math.abs(coefficient)} ${candidate.variableName}`
    }

    return `+ ${coefficient} ${candidate.variableName}`
  })

  const constraints: string[] = []

  function addConstraint(candidateIndexes: number[], capacity: number) {
    if (candidateIndexes.length > 0) {
      const variables = candidateIndexes.map((candidateIndex) => candidates[candidateIndex].variableName).join(" + ")

      constraints.push(`constraint_${constraints.length}: ${variables} <= ${capacity}`)
    }
  }

  for (const groupSlots of slotsByGroup.values()) {
    for (const slot of groupSlots) {
      addConstraint(slot.candidateIndexes, slot.blocksByRoom.size)
    }
  }

  for (const candidateIndexes of candidatesBySelection.values()) {
    addConstraint(candidateIndexes, 1)
  }

  const slotsByRoom = new Map<string, Map<InterviewSlot, number[]>>()

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const roomKey = JSON.stringify([candidate.slot.applicationGroupId, candidate.roomName])
    const roomSlots = slotsByRoom.get(roomKey) ?? new Map<InterviewSlot, number[]>()
    const candidateIndexes = roomSlots.get(candidate.slot) ?? []
    candidateIndexes.push(candidateIndex)
    roomSlots.set(candidate.slot, candidateIndexes)
    slotsByRoom.set(roomKey, roomSlots)
  }

  for (const roomSlots of slotsByRoom.values()) {
    const slots = [...roomSlots.entries()]

    for (const [slotIndex, [slot, candidateIndexes]] of slots.entries()) {
      addConstraint(candidateIndexes, 1)

      for (const [otherSlot, otherCandidateIndexes] of slots.slice(slotIndex + 1)) {
        if (
          areIntervalsOverlapping(
            { start: slot.startsAt, end: slot.endsAt },
            { start: otherSlot.startsAt, end: otherSlot.endsAt }
          )
        ) {
          addConstraint([...candidateIndexes, ...otherCandidateIndexes], 1)
        }
      }
    }
  }

  for (const applicationSlots of slotsByApplication.values()) {
    const slots = [...applicationSlots.entries()]

    for (let firstIndex = 0; firstIndex < slots.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < slots.length; secondIndex += 1) {
        const [firstSlot, firstCandidateIndexes] = slots[firstIndex]
        const [secondSlot, secondCandidateIndexes] = slots[secondIndex]

        if (slotsConflict(firstSlot, secondSlot)) {
          addConstraint([...firstCandidateIndexes, ...secondCandidateIndexes], 1)
        }
      }
    }
  }

  const assignmentVariableNames = candidates.map((candidate) => candidate.variableName)
  const interviewCountExpression = assignmentVariableNames.join(" + ")
  const applicantCoverageVariableNames: string[] = []

  for (const applicationSlots of slotsByApplication.values()) {
    const candidateIndexes = [...applicationSlots.values()].flat()

    if (candidateIndexes.length === 0) {
      continue
    }

    const coverageIndex = applicantCoverageVariableNames.length
    const coverageVariableName = `applicant_covered_${coverageIndex}`
    applicantCoverageVariableNames.push(coverageVariableName)
    const assignmentExpression = candidateIndexes
      .map((candidateIndex) => candidates[candidateIndex].variableName)
      .join(" + ")
    const maximumApplicantInterviews = new Set(
      candidateIndexes.map((candidateIndex) => candidates[candidateIndex].groupSelectionId)
    ).size

    // The coverage variable is one exactly when this applicant has at least one assigned interview.
    constraints.push(
      `applicant_coverage_lower_${coverageIndex}: ${assignmentExpression} - ${coverageVariableName} >= 0`
    )
    constraints.push(
      `applicant_coverage_upper_${coverageIndex}: ${assignmentExpression} - ${maximumApplicantInterviews} ${coverageVariableName} <= 0`
    )
  }

  const variableNames = [...assignmentVariableNames, ...applicantCoverageVariableNames]

  function createModel(objective: string, direction: "Maximize" | "Minimize" = "Maximize"): string {
    return [
      direction,
      `objective: ${objective}`,
      "Subject To",
      ...constraints,
      "Binaries",
      ...variableNames,
      "End",
    ].join("\n")
  }

  if (solverPromise === undefined) {
    solverPromise = loadHighs()
  }

  const solver = await solverPromise
  const solverOptions = {
    output_flag: false,
    mip_rel_gap: 0,
    mip_abs_gap: 0,
  }

  // Establish the maximum feasible count independently of all time preferences.
  const countSolution = solver.solve(createModel(interviewCountExpression), solverOptions)

  if (countSolution.Status !== "Optimal") {
    throw new IllegalStateError(`Interview count maximization failed with solver status ${countSolution.Status}`)
  }

  // Binary assignments make the optimum integral; round away floating-point solver noise.
  const maximumInterviewCount = Math.round(countSolution.ObjectiveValue)
  constraints.push(`interview_count: ${interviewCountExpression} = ${maximumInterviewCount}`)

  // Among schedules with that maximum count, serve as many distinct applicants as possible.
  const applicantCoverageExpression = applicantCoverageVariableNames.join(" + ")
  const coverageSolution = solver.solve(createModel(applicantCoverageExpression), solverOptions)

  if (coverageSolution.Status !== "Optimal") {
    throw new IllegalStateError(`Applicant coverage maximization failed with solver status ${coverageSolution.Status}`)
  }

  const maximumApplicantCoverage = Math.round(coverageSolution.ObjectiveValue)
  constraints.push(`applicant_coverage: ${applicantCoverageExpression} = ${maximumApplicantCoverage}`)

  const shortNoticePenaltyTerms = candidates.flatMap((candidate, candidateIndex) => {
    const penalty = preferencePenalties[candidateIndex].shortNoticePenalty

    if (penalty === 0) {
      return []
    }

    return [`${penalty} ${candidate.variableName}`]
  })

  // Skip the short-notice pass when every feasible assignment has zero short-notice penalty.
  if (shortNoticePenaltyTerms.length > 0) {
    // Use unscaled penalties so the numerical tolerance does not grow with the candidate count.
    const shortNoticePenaltyExpression = shortNoticePenaltyTerms.join(" + ")
    const shortNoticeSolution = solver.solve(createModel(shortNoticePenaltyExpression, "Minimize"), solverOptions)

    if (shortNoticeSolution.Status !== "Optimal") {
      throw new IllegalStateError(
        `Short-notice penalty minimization failed with solver status ${shortNoticeSolution.Status}`
      )
    }

    constraints.push(
      `short_notice_penalty: ${shortNoticePenaltyExpression} <= ${shortNoticeSolution.ObjectiveValue + PREFERENCE_PENALTY_TOLERANCE}`
    )
  }

  // With interview count, applicant coverage, and short-notice score fixed, optimize noon placement.
  const preferenceSolution = solver.solve(createModel(objectiveTerms.join(" ")), solverOptions)

  if (preferenceSolution.Status !== "Optimal") {
    throw new IllegalStateError(`Interview matching failed with solver status ${preferenceSolution.Status}`)
  }

  const clusteringPenaltyTerms: string[] = []
  let optimalClusteringPenalty = 0

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const penalty = preferencePenalties[candidateIndex].clusteringPenalty

    if (penalty === 0) {
      continue
    }

    clusteringPenaltyTerms.push(`${penalty} ${candidate.variableName}`)
    const column = preferenceSolution.Columns[candidate.variableName]

    if ("Primal" in column && column.Primal >= 0.5) {
      optimalClusteringPenalty += penalty
    }
  }

  if (clusteringPenaltyTerms.length > 0) {
    constraints.push(
      `noon_penalty: ${clusteringPenaltyTerms.join(" + ")} <= ${optimalClusteringPenalty + PREFERENCE_PENALTY_TOLERANCE}`
    )
  }

  const groupingObjectiveTerms: string[] = []

  for (const groupSlots of slotsByGroup.values()) {
    const slotsByDay = new Map<string, InterviewSlot[]>()

    for (const slot of groupSlots.filter((slot) => slot.candidateIndexes.length > 0)) {
      const day = format(slot.startsAt, "yyyy-MM-dd", interviewDateContext)
      const daySlots = slotsByDay.get(day) ?? []
      daySlots.push(slot)
      slotsByDay.set(day, daySlots)
    }

    for (const daySlots of slotsByDay.values()) {
      const dayIndex = groupingObjectiveTerms.length
      const startVariableName = `committee_day_start_${dayIndex}`
      const endVariableName = `committee_day_end_${dayIndex}`
      const usedVariableName = `committee_day_used_${dayIndex}`
      variableNames.push(usedVariableName)
      const origin = min(daySlots.map((slot) => slot.startsAt))
      const latestEnd = max(daySlots.map((slot) => slot.endsAt))
      const maximumSpanMinutes = differenceInMilliseconds(latestEnd, origin) / minutesToMilliseconds(1)
      const dayCandidateIndexes = daySlots.flatMap((slot) => slot.candidateIndexes)
      const assignmentExpression = dayCandidateIndexes
        .map((candidateIndex) => candidates[candidateIndex].variableName)
        .join(" + ")
      const maximumDayInterviews = new Set(
        dayCandidateIndexes.map((candidateIndex) => candidates[candidateIndex].groupSelectionId)
      ).size

      // Unused days contribute zero; used days span the earliest start through the latest end.
      constraints.push(`committee_day_lower_${dayIndex}: ${assignmentExpression} - ${usedVariableName} >= 0`)
      constraints.push(
        `committee_day_upper_${dayIndex}: ${assignmentExpression} - ${maximumDayInterviews} ${usedVariableName} <= 0`
      )
      constraints.push(
        `committee_day_start_bound_${dayIndex}: ${startVariableName} - ${maximumSpanMinutes} ${usedVariableName} <= 0`
      )
      constraints.push(
        `committee_day_end_bound_${dayIndex}: ${endVariableName} - ${maximumSpanMinutes} ${usedVariableName} <= 0`
      )

      for (const [slotIndex, slot] of daySlots.entries()) {
        const startMinutes = differenceInMilliseconds(slot.startsAt, origin) / minutesToMilliseconds(1)
        const endMinutes = differenceInMilliseconds(slot.endsAt, origin) / minutesToMilliseconds(1)

        const slotUsedVariableName = `committee_slot_used_${dayIndex}_${slotIndex}`
        variableNames.push(slotUsedVariableName)
        const slotAssignmentExpression = slot.candidateIndexes
          .map((candidateIndex) => candidates[candidateIndex].variableName)
          .join(" + ")

        // One occupancy variable per slot avoids repeating span constraints for every applicant and room.
        constraints.push(
          `committee_slot_lower_${dayIndex}_${slotIndex}: ${slotAssignmentExpression} - ${slotUsedVariableName} >= 0`
        )
        constraints.push(
          `committee_slot_upper_${dayIndex}_${slotIndex}: ${slotAssignmentExpression} - ${slot.blocksByRoom.size} ${slotUsedVariableName} <= 0`
        )
        constraints.push(
          `committee_start_${dayIndex}_${slotIndex}: ${startVariableName} + ${maximumSpanMinutes} ${slotUsedVariableName} <= ${startMinutes + maximumSpanMinutes}`
        )
        constraints.push(
          `committee_end_${dayIndex}_${slotIndex}: ${endVariableName} - ${endMinutes} ${slotUsedVariableName} >= 0`
        )
      }

      groupingObjectiveTerms.push(`+ ${endVariableName} - ${startVariableName}`)
    }
  }

  // Compact committee days only after preserving interview count, coverage, and both time preferences.
  const solution = solver.solve(createModel(groupingObjectiveTerms.join(" "), "Minimize"), solverOptions)

  if (solution.Status !== "Optimal") {
    throw new IllegalStateError(`Interview grouping failed with solver status ${solution.Status}`)
  }

  const interviews: CommitteeApplicationInterviewMatchingResult["interviews"] = []
  const allocatedApplicationIds = new Set<string>()
  let objectiveValue = 0

  for (const [candidateIndex, candidate] of candidates.entries()) {
    const column = solution.Columns[candidate.variableName]

    if (!("Primal" in column) || column.Primal < 0.5) {
      continue
    }

    allocatedApplicationIds.add(candidate.applicationId)
    const penalties = preferencePenalties[candidateIndex]
    objectiveValue += 1 - clusteringWeight * (penalties.clusteringPenalty + penalties.shortNoticePenalty)

    interviews.push({
      groupSelectionId: candidate.groupSelectionId,
      applicationGroupId: candidate.slot.applicationGroupId,
      interviewBlockId: candidate.interviewBlockId,
      startsAt: toDate(candidate.slot.startsAt),
      endsAt: toDate(candidate.slot.endsAt),
    })
  }

  if (interviews.length !== maximumInterviewCount) {
    throw new IllegalStateError(
      `Interview matching returned ${interviews.length} interviews instead of the maximum ${maximumInterviewCount}`
    )
  }

  if (allocatedApplicationIds.size !== maximumApplicantCoverage) {
    throw new IllegalStateError(
      `Interview matching served ${allocatedApplicationIds.size} applicants instead of the maximum ${maximumApplicantCoverage}`
    )
  }

  return {
    solverStatus: "OPTIMAL",
    objectiveValue,
    totalWantedInterviews: data.groupSelections.length,
    matchedInterviews: interviews.length,
    interviews,
  }
}
