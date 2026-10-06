import {
  type CommitteeApplicationOpenPeriod,
  isInterviewAvailabilityValid,
} from "@dotkomonline/rpc/committee-application"
import { describe, expect, it } from "vitest"
import {
  formatCalendarTime,
  getCalendarAvailability,
  getInterviewDateRange,
  mergeInterviewAvailability,
  parseInterviewAvailability,
  subtractInterviewIntervals,
  getAvailableInterviewHours,
  getInterviewCalendarBounds,
} from "./interview-availability"

const applicationPeriod: CommitteeApplicationOpenPeriod = {
  id: "period-id",
  name: "Komitéopptak",
  applicationsCloseAt: new Date("2026-10-10T20:00:00Z"),
  interviewsStartDate: new Date("2026-10-24"),
  interviewsEndDate: new Date("2026-10-26"),
  groups: [],
  interviewWindows: [],
}

describe("interview availability", () => {
  it("subtracts overlapping exclusions from the union of interview windows without counting gaps", () => {
    const windows = [
      parseInterviewAvailability("2026-10-24", "09:00", "12:00"),
      parseInterviewAvailability("2026-10-24", "11:00", "13:00"),
      parseInterviewAvailability("2026-10-24", "15:00", "17:00"),
    ]
    const exclusions = [
      parseInterviewAvailability("2026-10-24", "08:00", "10:00"),
      parseInterviewAvailability("2026-10-24", "11:00", "12:00"),
      parseInterviewAvailability("2026-10-24", "11:30", "16:00"),
    ]
    const remaining = subtractInterviewIntervals(windows, exclusions)

    expect(remaining).toEqual([
      parseInterviewAvailability("2026-10-24", "10:00", "11:00"),
      parseInterviewAvailability("2026-10-24", "16:00", "17:00"),
    ])
    expect(getAvailableInterviewHours(windows)).toBe(6)
    expect(getAvailableInterviewHours(remaining)).toBe(2)
    expect(subtractInterviewIntervals(windows, windows)).toEqual([])
    expect(getInterviewCalendarBounds(windows)).toEqual({ slotMinTime: "09:00:00", slotMaxTime: "17:00:00" })
  })

  it("keeps midnight boundaries and counts real hours across the daylight-saving change", () => {
    const windows = [{ startsAt: new Date("2026-10-24T22:00:00Z"), endsAt: new Date("2026-10-26T23:00:00Z") }]
    const remaining = subtractInterviewIntervals(windows, [])

    expect(remaining).toEqual([
      { startsAt: new Date("2026-10-24T22:00:00Z"), endsAt: new Date("2026-10-25T23:00:00Z") },
      { startsAt: new Date("2026-10-25T23:00:00Z"), endsAt: new Date("2026-10-26T23:00:00Z") },
    ])
    expect(getAvailableInterviewHours(remaining)).toBe(49)
    expect(getInterviewCalendarBounds(windows)).toEqual({ slotMinTime: "00:00:00", slotMaxTime: "24:00:00" })
  })

  it("includes the first and last interview dates and gives the calendar an exclusive end", () => {
    expect(getInterviewDateRange(applicationPeriod)).toEqual({
      start: "2026-10-24",
      lastDay: "2026-10-26",
      end: "2026-10-27",
    })
  })

  it.each([
    ["2026-10-24", "09:00", "17:00", true],
    ["2026-10-26", "09:00", "17:00", true],
    ["2026-10-23", "09:00", "10:00", false],
    ["2026-10-27", "09:00", "10:00", false],
    ["2026-10-24", "08:50", "10:00", true],
    ["2026-10-24", "16:00", "17:10", true],
    ["2026-10-24", "10:00", "10:00", false],
    ["2026-10-24", "11:00", "10:00", false],
    ["", "09:00", "10:00", false],
  ])("validates %s %s–%s as %s", (date, startsAt, endsAt, expected) => {
    expect(isInterviewAvailabilityValid(parseInterviewAvailability(date, startsAt, endsAt), applicationPeriod)).toBe(
      expected
    )
  })

  it("rejects a calendar selection spanning several interview days", () => {
    const availability = getCalendarAvailability(new Date("2026-10-24T09:00:00Z"), new Date("2026-10-25T10:00:00Z"))
    expect(isInterviewAvailabilityValid(availability, applicationPeriod)).toBe(false)
  })

  it.each([
    ["2026-10-24", "2026-10-24T07:00:00.000Z", "2026-10-24T15:00:00.000Z"],
    ["2026-10-26", "2026-10-26T08:00:00.000Z", "2026-10-26T16:00:00.000Z"],
  ])("converts Norwegian wall times to instants across the DST change on %s", (date, startsAt, endsAt) => {
    const availability = parseInterviewAvailability(date, "09:00", "17:00")
    expect(availability.startsAt.toISOString()).toBe(startsAt)
    expect(availability.endsAt.toISOString()).toBe(endsAt)
    expect(formatCalendarTime(availability.startsAt)).toBe(`${date}T09:00:00`)
    expect(formatCalendarTime(availability.endsAt)).toBe(`${date}T17:00:00`)

    const calendarAvailability = getCalendarAvailability(new Date(`${date}T09:00:00Z`), new Date(`${date}T17:00:00Z`))
    expect(calendarAvailability.startsAt.getTime()).toBe(availability.startsAt.getTime())
    expect(calendarAvailability.endsAt.getTime()).toBe(availability.endsAt.getTime())
  })

  it("merges overlapping and adjacent ranges without changing existing state", () => {
    const first = parseInterviewAvailability("2026-10-24", "09:00", "10:00")
    const last = parseInterviewAvailability("2026-10-24", "11:00", "12:00")
    const nextDay = parseInterviewAvailability("2026-10-25", "09:00", "10:00")
    const currentAvailability = [nextDay, last, first]
    const merged = mergeInterviewAvailability(
      currentAvailability,
      parseInterviewAvailability("2026-10-24", "10:00", "11:30")
    )

    expect(merged).toHaveLength(2)
    expect(formatCalendarTime(merged[0].startsAt)).toBe("2026-10-24T09:00:00")
    expect(formatCalendarTime(merged[0].endsAt)).toBe("2026-10-24T12:00:00")
    expect(merged[1]).toEqual(nextDay)
    expect(formatCalendarTime(first.endsAt)).toBe("2026-10-24T10:00:00")
    expect(currentAvailability).toEqual([nextDay, last, first])
  })
})
