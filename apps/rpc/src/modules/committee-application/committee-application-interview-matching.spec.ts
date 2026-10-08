import { addMinutes, compareAsc, differenceInMinutes, isAfter, isBefore, parseISO, subHours } from "date-fns"
import { describe, expect, it } from "vitest"
import type { CommitteeApplicationInterviewMatchingInput } from "./committee-application"
import { matchCommitteeApplicationInterviews } from "./committee-application-interview-matching"
import { createInterviewMatchingFixture } from "./committee-application-interview-matching.fixture"

function emptyInput(): CommitteeApplicationInterviewMatchingInput {
  return {
    interviewsPublishedAt: parseISO("2026-10-10T20:00:00Z"),
    applications: [],
    groups: [],
    groupSelections: [],
    availabilityBlocks: [],
    interviewBlocks: [],
  }
}

function interviewTime(time: string, day = 12) {
  return parseISO(`2026-10-${String(day).padStart(2, "0")}T${time}:00Z`)
}

function addGroup(
  input: CommitteeApplicationInterviewMatchingInput,
  groupId: string,
  interviewDuration: "MINUTES_20" | "MINUTES_30",
  blocks: { startsAt: Date; endsAt: Date; locationName?: string }[]
) {
  input.groups.push({ id: groupId, interviewDuration })
  input.interviewBlocks.push(
    ...blocks.map((block, blockIndex) => ({
      id: `${groupId}-block-${blockIndex}`,
      applicationGroupId: groupId,
      locationName: "Room A",
      ...block,
    }))
  )
}

function addApplicant(
  input: CommitteeApplicationInterviewMatchingInput,
  applicationId: string,
  groupIds: string[],
  availability: { startsAt: Date; endsAt: Date }[]
) {
  input.applications.push({ id: applicationId })
  input.groupSelections.push(
    ...groupIds.map((groupId) => ({
      id: `${applicationId}:${groupId}`,
      applicationId,
      applicationGroupId: groupId,
    }))
  )
  input.availabilityBlocks.push(...availability.map((interval) => ({ applicationId, ...interval })))
}

describe("matchCommitteeApplicationInterviews", () => {
  it("does not double-book a room when interview blocks have differently aligned overlapping slots", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30"), locationName: "Room A" },
      { startsAt: interviewTime("11:15"), endsAt: interviewTime("11:45"), locationName: "Room A" },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30") }])
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("11:15"), endsAt: interviewTime("11:45") }])

    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
  })

  it("keeps the actual chosen room when differently aligned slots overlap in separate rooms", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30"), locationName: "Room A" },
      { startsAt: interviewTime("11:15"), endsAt: interviewTime("11:45"), locationName: "Room A" },
      { startsAt: interviewTime("11:15"), endsAt: interviewTime("11:45"), locationName: "Room B" },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30") }])
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("11:15"), endsAt: interviewTime("11:45") }])

    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(2)
    expect(result.interviews.find((interview) => interview.groupSelectionId === "alice:dotkom")?.interviewBlockId).toBe(
      "dotkom-block-0"
    )
    expect(result.interviews.find((interview) => interview.groupSelectionId === "bob:dotkom")?.interviewBlockId).toBe(
      "dotkom-block-2"
    )
  })

  it("groups equally preferred interviews into a compact committee session", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("13:00") }])
    addApplicant(
      input,
      "alice",
      ["dotkom"],
      [
        { startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30") },
        { startsAt: interviewTime("12:30"), endsAt: interviewTime("13:00") },
      ]
    )
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("11:30"), endsAt: interviewTime("12:30") }])

    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(2)
    const interviews = result.interviews.toSorted((first, second) => compareAsc(first.startsAt, second.startsAt))
    expect(differenceInMinutes(interviews[1].startsAt, interviews[0].endsAt)).toBe(0)
    expect(result.objectiveValue).toBeCloseTo(2 - 30 / 720 / 4, 10)
  })

  it("maximizes applicant coverage among schedules with the maximum interview count", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = interviewTime("20:00", 11)
    addGroup(input, "dotkom", "MINUTES_20", [
      { startsAt: interviewTime("12:00", 13), endsAt: interviewTime("12:20", 13) },
    ])
    addGroup(input, "appkom", "MINUTES_20", [
      { startsAt: interviewTime("12:35", 13), endsAt: interviewTime("12:55", 13) },
    ])
    addApplicant(
      input,
      "alice",
      ["dotkom", "appkom"],
      [{ startsAt: interviewTime("12:00", 13), endsAt: interviewTime("13:00", 13) }]
    )
    addApplicant(
      input,
      "bob",
      ["dotkom"],
      [{ startsAt: interviewTime("12:00", 13), endsAt: interviewTime("12:20", 13) }]
    )
    addApplicant(
      input,
      "unavailable",
      ["dotkom"],
      [{ startsAt: interviewTime("17:00"), endsAt: interviewTime("18:00") }]
    )

    const result = await matchCommitteeApplicationInterviews(input)
    // Giving both slots to Alice has the same count and time score, but serves only one person.
    expect(result.matchedInterviews).toBe(2)
    expect(result.interviews.map((interview) => interview.groupSelectionId).toSorted()).toEqual([
      "alice:appkom",
      "bob:dotkom",
    ])
    expect(result.interviews.find((interview) => interview.groupSelectionId === "alice:appkom")?.startsAt).toEqual(
      interviewTime("12:35", 13)
    )
  })

  it("preserves the maximum interview count while distributing interviews across applicants", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("10:20") }])
    addGroup(input, "appkom", "MINUTES_20", [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("10:20") }])
    addGroup(input, "bedkom", "MINUTES_20", [{ startsAt: interviewTime("10:35"), endsAt: interviewTime("10:55") }])
    addGroup(input, "fagkom", "MINUTES_20", [{ startsAt: interviewTime("11:10"), endsAt: interviewTime("11:30") }])
    addApplicant(
      input,
      "alice",
      ["dotkom", "bedkom", "fagkom"],
      [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("12:00") }]
    )
    addApplicant(
      input,
      "bob",
      ["appkom", "bedkom", "fagkom"],
      [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("12:00") }]
    )
    addApplicant(
      input,
      "charlie",
      ["dotkom", "appkom"],
      [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("10:20") }]
    )

    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(4)
    expect(new Set(result.interviews.map((interview) => interview.groupSelectionId.split(":")[0])).size).toBe(3)
  })

  it("schedules the shared 100-applicant calendar fixture within availability, room capacity, and applicant buffers", async () => {
    const { input, applicants } = createInterviewMatchingFixture()
    expect(applicants).toHaveLength(100)
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.solverStatus).toBe("OPTIMAL")
    expect(result.matchedInterviews).toBe(272)
    expect(result.totalWantedInterviews).toBe(input.groupSelections.length)
    expect(new Set(result.interviews.map((interview) => interview.groupSelectionId)).size).toBe(
      result.matchedInterviews
    )
    const selections = new Map(input.groupSelections.map((selection) => [selection.id, selection]))
    const blocks = new Map(input.interviewBlocks.map((block) => [block.id, block]))
    const interviewsByApplicant = new Map<string, typeof result.interviews>()
    const interviewsByRoom = new Map<string, typeof result.interviews>()

    for (const interview of result.interviews) {
      const selection = selections.get(interview.groupSelectionId)
      const block = blocks.get(interview.interviewBlockId)

      if (selection === undefined || block === undefined) {
        throw new Error("Matching returned an unknown selection or block")
      }

      expect(interview.applicationGroupId).toBe(selection.applicationGroupId)
      expect(block.applicationGroupId).toBe(selection.applicationGroupId)
      expect(isBefore(interview.startsAt, block.startsAt)).toBe(false)
      expect(isAfter(interview.endsAt, block.endsAt)).toBe(false)
      expect(
        input.availabilityBlocks.some(
          (availability) =>
            availability.applicationId === selection.applicationId &&
            !isBefore(interview.startsAt, availability.startsAt) &&
            !isAfter(interview.endsAt, availability.endsAt)
        )
      ).toBe(true)
      const applicantInterviews = interviewsByApplicant.get(selection.applicationId) ?? []
      applicantInterviews.push(interview)
      interviewsByApplicant.set(selection.applicationId, applicantInterviews)
      const roomKey = `${block.applicationGroupId}:${block.locationName}`
      const roomInterviews = interviewsByRoom.get(roomKey) ?? []
      roomInterviews.push(interview)
      interviewsByRoom.set(roomKey, roomInterviews)
    }

    for (const applicantInterviews of interviewsByApplicant.values()) {
      const sortedInterviews = applicantInterviews.toSorted((first, second) =>
        compareAsc(first.startsAt, second.startsAt)
      )

      for (let interviewIndex = 1; interviewIndex < sortedInterviews.length; interviewIndex += 1) {
        expect(
          differenceInMinutes(sortedInterviews[interviewIndex].startsAt, sortedInterviews[interviewIndex - 1].endsAt)
        ).toBeGreaterThanOrEqual(15)
      }
    }

    expect(interviewsByApplicant.size).toBe(100)

    for (const roomInterviews of interviewsByRoom.values()) {
      const sortedInterviews = roomInterviews.toSorted((first, second) => compareAsc(first.startsAt, second.startsAt))

      for (let interviewIndex = 1; interviewIndex < sortedInterviews.length; interviewIndex += 1) {
        expect(isBefore(sortedInterviews[interviewIndex].startsAt, sortedInterviews[interviewIndex - 1].endsAt)).toBe(
          false
        )
      }
    }
  }, 60_000)

  it.each([
    [-1, 1],
    [0, 1],
    [6, 0.5449457660765887],
    [12, 0.2689414213699951],
    [18, 0.1015363240915518],
    [23, 0.013602016976462955],
    [24, 0],
    [30, 0],
  ])("uses a normalized exponential notice penalty at %i hours", async (noticeHours, expectedPenalty) => {
    const input = emptyInput()
    const startsAt = interviewTime("12:00")
    const endsAt = addMinutes(startsAt, 30)
    input.interviewsPublishedAt = subHours(startsAt, noticeHours)
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt, endsAt, locationName: "Room A" },
      { startsAt, endsAt, locationName: "Room B" },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBeCloseTo(1 - expectedPenalty / 2, 10)
  })

  it("prefers more preparation time over noon placement during short notice", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = interviewTime("20:00", 11)
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") },
      { startsAt: interviewTime("15:00"), endsAt: interviewTime("15:30") },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("16:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.interviews[0].startsAt).toEqual(interviewTime("15:00"))
  })

  it("prefers a slot with at least 24 hours' notice while retaining earlier slots needed for the maximum count", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = interviewTime("20:00", 11)
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("09:00"), endsAt: interviewTime("09:30") },
      { startsAt: interviewTime("09:00", 13), endsAt: interviewTime("09:30", 13) },
    ])
    addApplicant(
      input,
      "alice",
      ["dotkom"],
      [
        { startsAt: interviewTime("09:00"), endsAt: interviewTime("09:30") },
        { startsAt: interviewTime("09:00", 13), endsAt: interviewTime("09:30", 13) },
      ]
    )
    expect((await matchCommitteeApplicationInterviews(input)).interviews[0].startsAt).toEqual(
      interviewTime("09:00", 13)
    )
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("09:00"), endsAt: interviewTime("09:30") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(2)
    expect(result.interviews.find((interview) => interview.groupSelectionId === "bob:dotkom")?.startsAt).toEqual(
      interviewTime("09:00")
    )
  })

  it("schedules a zero-scoring interview when it is needed for the maximum count", async () => {
    const input = emptyInput()
    const startsAt = interviewTime("09:00")
    const endsAt = addMinutes(startsAt, 30)
    input.interviewsPublishedAt = startsAt
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt, endsAt }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBeCloseTo(0, 10)
  })

  it.each([
    [1439, 0.00021753664707686572],
    [1440, 330 / 720],
    [1441, 330 / 720],
  ])("resumes noon scoring at exactly 24 hours (%i minutes)", async (noticeMinutes, expectedPenalty) => {
    const input = emptyInput()
    const startsAt = parseISO("2026-10-12T08:00:00+02:00")
    const endsAt = addMinutes(startsAt, 30)
    input.interviewsPublishedAt = addMinutes(startsAt, -noticeMinutes)
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt, endsAt }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    expect((await matchCommitteeApplicationInterviews(input)).objectiveValue).toBeCloseTo(1 - expectedPenalty, 8)
  })

  it("resumes noon scoring for later slots on the same calendar day", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = parseISO("2026-10-11T09:00:00+02:00")
    const earlyStartsAt = parseISO("2026-10-12T08:00:00+02:00")
    const startsAt = parseISO("2026-10-12T10:00:00+02:00")
    const endsAt = addMinutes(startsAt, 30)
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: earlyStartsAt, endsAt: addMinutes(earlyStartsAt, 30) },
      { startsAt, endsAt },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    expect((await matchCommitteeApplicationInterviews(input)).objectiveValue).toBeCloseTo(1 - 210 / 720, 10)
  })

  it("measures short notice from publication across midnight", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = parseISO("2026-10-12T23:00:00+02:00")
    const startsAt = parseISO("2026-10-13T09:00:00+02:00")
    const endsAt = addMinutes(startsAt, 30)
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt, endsAt }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    expect((await matchCommitteeApplicationInterviews(input)).objectiveValue).toBeCloseTo(1 - 0.3461028528961682, 10)
  })

  it.each([
    ["2026-10-24T08:00:00+02:00", "2026-10-25T08:00:00+01:00", 1 - 270 / 720],
    ["2026-03-28T08:00:00+01:00", "2026-03-29T08:00:00+02:00", 1 - 0.013602016976462955],
  ])("uses elapsed notice across Oslo daylight saving changes (%s)", async (publicationTime, interviewStart, expectedObjective) => {
    const input = emptyInput()
    input.interviewsPublishedAt = parseISO(publicationTime)
    const startsAt = parseISO(interviewStart)
    const endsAt = addMinutes(startsAt, 30)
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt, endsAt }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt, endsAt }])
    expect((await matchCommitteeApplicationInterviews(input)).objectiveValue).toBeCloseTo(expectedObjective, 10)
  })

  it("returns an optimal empty result when there are no applications", async () => {
    expect(await matchCommitteeApplicationInterviews(emptyInput())).toEqual({
      solverStatus: "OPTIMAL",
      objectiveValue: 0,
      totalWantedInterviews: 0,
      matchedInterviews: 0,
      interviews: [],
    })
  })

  it("counts wanted interviews even when no slot fits the applicant", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("11:50"), endsAt: interviewTime("12:10") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("12:10") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.totalWantedInterviews).toBe(1)
    expect(result.matchedInterviews).toBe(0)
  })

  it("finds the global assignment instead of consuming the only slot available to a constrained applicant", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("12:00") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("12:00") }])
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("11:30") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(2)
    expect(result.interviews.find((interview) => interview.groupSelectionId === "alice:dotkom")?.startsAt).toEqual(
      interviewTime("11:30")
    )
    expect(result.interviews.find((interview) => interview.groupSelectionId === "bob:dotkom")?.startsAt).toEqual(
      interviewTime("11:00")
    )
    // Three feasible applicant-slot-room variables, with enough notice to avoid the morning penalty.
    expect(result.objectiveValue).toBeCloseTo(2 - 30 / 720 / 3, 10)
  })

  it.each([
    ["11:19", 1],
    ["11:20", 1],
    ["11:34", 1],
    ["11:35", 2],
  ])("allows two interviews only when the second starts at least 15 minutes after the first (%s)", async (secondStart, expectedCount) => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("11:20") }])
    const secondStartsAt = interviewTime(secondStart)
    addGroup(input, "appkom", "MINUTES_20", [{ startsAt: secondStartsAt, endsAt: addMinutes(secondStartsAt, 20) }])
    addApplicant(
      input,
      "alice",
      ["dotkom", "appkom"],
      [{ startsAt: interviewTime("10:00"), endsAt: interviewTime("13:00") }]
    )
    expect((await matchCommitteeApplicationInterviews(input)).matchedInterviews).toBe(expectedCount)
  })

  it("merges touching and overlapping applicant availability before checking full-slot containment", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("11:50"), endsAt: interviewTime("12:10") }])
    addApplicant(
      input,
      "alice",
      ["dotkom"],
      [
        { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:10") },
        { startsAt: interviewTime("11:50"), endsAt: interviewTime("12:00") },
        { startsAt: interviewTime("11:55"), endsAt: interviewTime("12:05") },
      ]
    )
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBe(1)
  })

  it("discards incomplete slots at the end of a committee block", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt: interviewTime("11:50"), endsAt: interviewTime("12:25") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("13:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.interviews).toHaveLength(1)
    expect(result.interviews[0].endsAt).toEqual(interviewTime("12:20"))
  })

  it("schedules a single morning candidate when there is enough notice", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("09:00"), endsAt: interviewTime("09:20") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("09:00"), endsAt: interviewTime("10:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBeCloseTo(1 - 160 / 720, 10)
  })

  it("does not shift the short-notice penalty to the earliest feasible applicant day", async () => {
    const input = emptyInput()
    input.interviewsPublishedAt = interviewTime("20:00", 11)
    addGroup(input, "dotkom", "MINUTES_20", [
      { startsAt: interviewTime("12:00", 12), endsAt: interviewTime("12:20", 12) },
      { startsAt: interviewTime("12:00", 13), endsAt: interviewTime("12:20", 13) },
      { startsAt: interviewTime("12:00", 14), endsAt: interviewTime("12:20", 14) },
    ])
    addApplicant(
      input,
      "alice",
      ["dotkom"],
      [
        { startsAt: interviewTime("11:00", 13), endsAt: interviewTime("13:00", 13) },
        { startsAt: interviewTime("11:00", 14), endsAt: interviewTime("13:00", 14) },
      ]
    )
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBe(1)
  })

  it.each([
    ["11:40", "12:00"],
    ["11:50", "12:10"],
    ["12:00", "12:20"],
  ])("assigns zero distance for an interview touching or spanning noon (%s-%s)", async (startTime, endTime) => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [
      { startsAt: interviewTime(startTime), endsAt: interviewTime(endTime) },
      { startsAt: interviewTime("12:10"), endsAt: interviewTime("12:30") },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("13:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.interviews[0].startsAt).toEqual(interviewTime(startTime))
    expect(result.objectiveValue).toBe(1)
  })

  it("uses UTC calendar days for scoring slots around midnight", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [
      { startsAt: interviewTime("23:50", 12), endsAt: interviewTime("00:10", 13) },
      { startsAt: interviewTime("00:10", 13), endsAt: interviewTime("00:30", 13) },
    ])
    addApplicant(
      input,
      "alice",
      ["dotkom"],
      [{ startsAt: interviewTime("23:00", 12), endsAt: interviewTime("01:00", 13) }]
    )
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.interviews[0].startsAt).toEqual(interviewTime("00:10", 13))
    expect(result.objectiveValue).toBeCloseTo(1 - 690 / 720 / 2, 10)
  })

  it("counts room choices in the weight denominator and allocates parallel interviews to distinct blocks", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30"), locationName: "Room A" },
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30"), locationName: "Room B" },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") }])
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(2)
    expect(new Set(result.interviews.map((interview) => interview.interviewBlockId)).size).toBe(2)
    expect(result.objectiveValue).toBe(2)
  })

  it("does not increase capacity for duplicate blocks in the same room", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") },
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") }])
    addApplicant(input, "bob", ["dotkom"], [{ startsAt: interviewTime("12:00"), endsAt: interviewTime("12:30") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(1)
    expect(result.objectiveValue).toBe(1)
  })
})
