import { addMinutes, compareAsc, differenceInMinutes, isAfter, isBefore, parseISO } from "date-fns"
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

  it("schedules the shared 100-applicant calendar fixture within availability, room capacity, and applicant buffers", async () => {
    const { input, applicants } = createInterviewMatchingFixture()
    expect(applicants).toHaveLength(100)
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.solverStatus).toBe("OPTIMAL")
    expect(result.matchedInterviews).toBeGreaterThan(100)
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

    for (const roomInterviews of interviewsByRoom.values()) {
      const sortedInterviews = roomInterviews.toSorted((first, second) => compareAsc(first.startsAt, second.startsAt))

      for (let interviewIndex = 1; interviewIndex < sortedInterviews.length; interviewIndex += 1) {
        expect(isBefore(sortedInterviews[interviewIndex].startsAt, sortedInterviews[interviewIndex - 1].endsAt)).toBe(
          false
        )
      }
    }
  }, 60_000)

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
    // Three feasible applicant-slot-room variables: 2 - 2/9 - (30 minutes / 12 hours)/3.
    expect(result.objectiveValue).toBeCloseTo(2 - 2 / 9 - 30 / 720 / 3, 10)
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
    expect(result.objectiveValue).toBeCloseTo(10 / 720, 10)
  })

  it("discards incomplete slots at the end of a committee block", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_30", [{ startsAt: interviewTime("11:50"), endsAt: interviewTime("12:25") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("13:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.interviews).toHaveLength(1)
    expect(result.interviews[0].endsAt).toEqual(interviewTime("12:20"))
  })

  it("preserves the upstream negative objective for a single candidate away from noon", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [{ startsAt: interviewTime("09:00"), endsAt: interviewTime("09:20") }])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("09:00"), endsAt: interviewTime("10:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.matchedInterviews).toBe(0)
    expect(result.objectiveValue).toBe(0)
  })

  it("penalizes the earliest feasible candidate day rather than the first configured interview day", async () => {
    const input = emptyInput()
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
    expect(result.interviews[0].startsAt).toEqual(interviewTime("12:00", 14))
    expect(result.objectiveValue).toBe(1)
  })

  it("preserves the bonus for an interval crossing noon", async () => {
    const input = emptyInput()
    addGroup(input, "dotkom", "MINUTES_20", [
      { startsAt: interviewTime("11:50"), endsAt: interviewTime("12:10") },
      { startsAt: interviewTime("12:00"), endsAt: interviewTime("12:20") },
    ])
    addApplicant(input, "alice", ["dotkom"], [{ startsAt: interviewTime("11:00"), endsAt: interviewTime("13:00") }])
    const result = await matchCommitteeApplicationInterviews(input)
    expect(result.interviews[0].startsAt).toEqual(interviewTime("11:50"))
    expect(result.objectiveValue).toBeCloseTo(1 - 1 / 4 + 10 / 720 / 2, 10)
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
    expect(result.objectiveValue).toBeCloseTo(2 - 2 / 16, 10)
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
    expect(result.objectiveValue).toBeCloseTo(1 - 1 / 4, 10)
  })
})
