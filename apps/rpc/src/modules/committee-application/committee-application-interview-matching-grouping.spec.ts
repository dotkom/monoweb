import { describe, expect, it, vi } from "vitest"
import type { CommitteeApplicationInterviewMatchingInput } from "./committee-application"
import { getInterviewScheduleScore } from "./committee-application"
import { matchCommitteeApplicationInterviews } from "./committee-application-interview-matching"

const observed = vi.hoisted(() => ({ didSupplySparseOptimum: false }))

vi.mock("highs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("highs")>()

  return {
    ...actual,
    default: async () => {
      const solver = await actual.default()

      return {
        ...solver,
        solve(problem: string, options: Parameters<typeof solver.solve>[1]) {
          const solution = solver.solve(problem, options)
          const isPreferencePass =
            problem.startsWith("Maximize") &&
            problem.includes("applicant_coverage:") &&
            !problem.includes("committee_day_")

          if (!isPreferencePass) {
            return solution
          }

          // This is an equally optimal preference solution with a 30-minute hole.
          observed.didSupplySparseOptimum = true

          return {
            ...solution,
            Columns: {
              ...solution.Columns,
              assignment_0: { ...solution.Columns.assignment_0, Primal: 1 },
              assignment_1: { ...solution.Columns.assignment_1, Primal: 0 },
              assignment_2: { ...solution.Columns.assignment_2, Primal: 0 },
              assignment_3: { ...solution.Columns.assignment_3, Primal: 1 },
            },
          }
        },
      }
    },
  }
})

describe("committee session grouping", () => {
  it("improves a sparse preference optimum from 90 to 60 minutes without worsening earlier priorities", async () => {
    const time = (hour: number, minute = 0) => new Date(Date.UTC(2026, 9, 12, hour, minute))
    const input: CommitteeApplicationInterviewMatchingInput = {
      publicationReferenceTime: new Date("2026-10-10T00:00:00Z"),
      applications: [{ id: "alice" }, { id: "bob" }],
      groups: [{ id: "group", interviewDuration: "MINUTES_30" }],
      groupSelections: [
        { id: "alice-selection", applicationId: "alice", applicationGroupId: "group" },
        { id: "bob-selection", applicationId: "bob", applicationGroupId: "group" },
      ],
      availabilityBlocks: [
        { applicationId: "alice", startsAt: time(11), endsAt: time(11, 30) },
        { applicationId: "alice", startsAt: time(12, 30), endsAt: time(13) },
        { applicationId: "bob", startsAt: time(11, 30), endsAt: time(12, 30) },
      ],
      interviewBlocks: [
        { id: "block", applicationGroupId: "group", locationName: "Room", startsAt: time(11), endsAt: time(13) },
      ],
    }
    const sparse = [
      {
        groupSelectionId: "alice-selection",
        applicationGroupId: "group",
        interviewBlockId: "block",
        startsAt: time(11),
        endsAt: time(11, 30),
      },
      {
        groupSelectionId: "bob-selection",
        applicationGroupId: "group",
        interviewBlockId: "block",
        startsAt: time(12),
        endsAt: time(12, 30),
      },
    ]

    const result = await matchCommitteeApplicationInterviews(input)
    const before = getInterviewScheduleScore(input, sparse)
    const after = getInterviewScheduleScore(input, result.interviews)

    expect(observed.didSupplySparseOptimum).toBe(true)
    expect(after.interviewCount).toBe(before.interviewCount)
    expect(after.applicantCount).toBe(before.applicantCount)
    expect(after.shortNoticePenalty).toBe(before.shortNoticePenalty)
    expect(after.clusteringPenalty).toBeCloseTo(before.clusteringPenalty, 12)
    expect(before.committeeSpanMilliseconds).toBe(90 * 60_000)
    expect(after.committeeSpanMilliseconds).toBe(60 * 60_000)
  })
})
