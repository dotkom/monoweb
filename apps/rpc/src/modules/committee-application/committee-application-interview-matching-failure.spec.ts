import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { IllegalStateError, ResourceExhaustedError } from "../../error"
import type { CommitteeApplicationInterviewMatchingInput } from "./committee-application"
import { matchCommitteeApplicationInterviews } from "./committee-application-interview-matching"

const state = vi.hoisted(() => ({ solve: vi.fn(), elapsedMilliseconds: 0 }))

vi.mock("highs", () => ({
  default: async () => ({ solve: state.solve }),
}))

const input: CommitteeApplicationInterviewMatchingInput = {
  publicationReferenceTime: new Date("2026-10-12T12:00:00Z"),
  applications: [{ id: "applicant" }],
  groups: [{ id: "group", interviewDuration: "MINUTES_30" }],
  groupSelections: [{ id: "selection", applicationId: "applicant", applicationGroupId: "group" }],
  availabilityBlocks: [
    {
      applicationId: "applicant",
      startsAt: new Date("2026-10-12T12:00:00Z"),
      endsAt: new Date("2026-10-12T12:30:00Z"),
    },
  ],
  interviewBlocks: [
    {
      id: "block",
      applicationGroupId: "group",
      locationName: "Room",
      startsAt: new Date("2026-10-12T12:00:00Z"),
      endsAt: new Date("2026-10-12T12:30:00Z"),
    },
  ],
}

beforeEach(() => {
  state.elapsedMilliseconds = 0
  state.solve.mockReset()
  state.solve.mockReturnValue({ Status: "Optimal", ObjectiveValue: 1, Columns: { assignment_0: { Primal: 1 } } })
  vi.spyOn(performance, "now").mockImplementation(() => state.elapsedMilliseconds)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("matching solver failures", () => {
  it.each([0, 1, 2, 3, 4])("rejects an unproven result from pass %i", async (failedPass) => {
    let callIndex = 0

    state.solve.mockImplementation(() => {
      const status = callIndex === failedPass ? "Time limit reached" : "Optimal"
      callIndex += 1

      return { Status: status, ObjectiveValue: 1, Columns: { assignment_0: { Primal: 1 } } }
    })

    await expect(matchCommitteeApplicationInterviews(input)).rejects.toThrow(IllegalStateError)
    expect(state.solve).toHaveBeenCalledTimes(failedPass + 1)
  })

  it("shares one time budget across passes instead of restarting the budget", async () => {
    state.solve.mockImplementation(() => {
      state.elapsedMilliseconds = 60_001

      return { Status: "Optimal", ObjectiveValue: 1, Columns: { assignment_0: { Primal: 1 } } }
    })

    await expect(matchCommitteeApplicationInterviews(input)).rejects.toThrow(ResourceExhaustedError)
    expect(state.solve).toHaveBeenCalledOnce()
  })
})
