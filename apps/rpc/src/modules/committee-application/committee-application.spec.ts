import { describe, expect, it } from "vitest"
import {
  CommitteeApplicationPeriodSchema,
  getInterviewDays,
  getInterviewWindow,
  isInterviewAvailabilityValid,
} from "./committee-application"

describe("daily interview hours in Europe/Oslo", () => {
  const period = {
    interviewsStartDate: new Date("2026-10-24"),
    interviewsEndDate: new Date("2026-10-26"),
    interviewsStartTime: "10:15",
    interviewsEndTime: "18:45",
  }

  it.each([
    ["2026-10-24T08:15:00Z", "2026-10-24T16:45:00Z", true],
    ["2026-10-25T09:15:00Z", "2026-10-25T17:45:00Z", true],
    ["2026-10-26T09:15:00Z", "2026-10-26T17:45:00Z", true],
    ["2026-10-25T09:14:00Z", "2026-10-25T17:45:00Z", false],
    ["2026-10-25T09:15:00Z", "2026-10-25T17:46:00Z", false],
    ["2026-10-23T08:15:00Z", "2026-10-23T16:45:00Z", false],
    ["2026-10-27T09:15:00Z", "2026-10-27T17:45:00Z", false],
    ["2026-10-24T08:15:00Z", "2026-10-25T17:45:00Z", false],
  ])("validates %s to %s", (startsAt, endsAt, isValid) => {
    const availability = { startsAt: new Date(startsAt), endsAt: new Date(endsAt) }

    expect(isInterviewAvailabilityValid(availability, period)).toBe(isValid)
  })

  it.each(["9:00", "24:00", "12:60", "12:00:00", ""])("rejects malformed time %s", (time) => {
    expect(CommitteeApplicationPeriodSchema.shape.interviewsStartTime.safeParse(time).success).toBe(false)
    expect(CommitteeApplicationPeriodSchema.shape.interviewsEndTime.safeParse(time).success).toBe(false)
  })

  it.each([
    [new Date("invalid"), new Date("2026-10-25T10:00:00Z")],
    [new Date("2026-10-25T10:00:00Z"), new Date("invalid")],
    [new Date("2026-10-25T10:00:00Z"), new Date("2026-10-25T10:00:00Z")],
    [new Date("2026-10-25T10:30:00Z"), new Date("2026-10-25T10:00:00Z")],
  ])("rejects invalid or non-positive intervals: %s to %s", (startsAt, endsAt) => {
    expect(isInterviewAvailabilityValid({ startsAt, endsAt }, period)).toBe(false)
  })

  it.each([
    ["2026-03-29T10:00:00Z", "2026-03-28T23:00:00Z", "2026-03-29T22:00:00Z"],
    ["2026-10-25T10:00:00Z", "2026-10-24T22:00:00Z", "2026-10-25T23:00:00Z"],
  ])("uses local calendar days across daylight saving changes: %s", (time, startsAt, endsAt) => {
    expect(getInterviewWindow(new Date(time))).toEqual({
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
    })
  })

  it("includes the entire final interview day across the autumn clock change", () => {
    expect(getInterviewDays(period)).toEqual({
      startsAt: new Date("2026-10-23T22:00:00Z"),
      endsAt: new Date("2026-10-26T23:00:00Z"),
    })
  })
})
