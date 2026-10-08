import { tz } from "@date-fns/tz"
import {
  addMilliseconds,
  addMinutes,
  areIntervalsOverlapping,
  compareAsc,
  differenceInMilliseconds,
  getTime,
  hoursToMilliseconds,
  isAfter,
  isBefore,
  isSameDay,
  max,
  min,
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
const dateContext = { in: tz("UTC") }

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
  const firstDayWeight = 1 / candidates.length ** 2

  const firstCandidateDay = min(candidates.map((candidate) => candidate.slot.startsAt))

  const objectiveTerms = candidates.map((candidate) => {
    const startTime = timeOnBaselineDay(candidate.slot.startsAt)
    let baselineDistance = differenceInMilliseconds(startTime, CLUSTERING_BASELINE)

    if (isBefore(startTime, CLUSTERING_BASELINE)) {
      baselineDistance = differenceInMilliseconds(CLUSTERING_BASELINE, timeOnBaselineDay(candidate.slot.endsAt))
    }

    let coefficient = 1 - (clusteringWeight * baselineDistance) / CLUSTERING_SCALE_MILLISECONDS

    if (isSameDay(candidate.slot.startsAt, firstCandidateDay, dateContext)) {
      coefficient -= firstDayWeight
    }

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

  const model = [
    "Maximize",
    `objective: ${objectiveTerms.join(" ")}`,
    "Subject To",
    ...constraints,
    "Binaries",
    ...candidates.map((candidate) => candidate.variableName),
    "End",
  ].join("\n")

  if (solverPromise === undefined) {
    solverPromise = loadHighs()
  }

  const solver = await solverPromise
  const solution = solver.solve(model, {
    output_flag: false,
    mip_rel_gap: 0,
    mip_abs_gap: 0,
  })

  if (solution.Status !== "Optimal") {
    throw new IllegalStateError(`Interview matching failed with solver status ${solution.Status}`)
  }

  const interviews: CommitteeApplicationInterviewMatchingResult["interviews"] = []

  for (const candidate of candidates) {
    const column = solution.Columns[candidate.variableName]

    if (!("Primal" in column) || column.Primal < 0.5) {
      continue
    }

    interviews.push({
      groupSelectionId: candidate.groupSelectionId,
      applicationGroupId: candidate.slot.applicationGroupId,
      interviewBlockId: candidate.interviewBlockId,
      startsAt: toDate(candidate.slot.startsAt),
      endsAt: toDate(candidate.slot.endsAt),
    })
  }

  return {
    solverStatus: "OPTIMAL",
    objectiveValue: solution.ObjectiveValue,
    totalWantedInterviews: data.groupSelections.length,
    matchedInterviews: interviews.length,
    interviews,
  }
}
