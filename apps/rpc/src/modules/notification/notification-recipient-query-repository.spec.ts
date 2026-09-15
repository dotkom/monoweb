import { describe, expect, it } from "vitest"
import { buildGroupMembershipSelectionFilter } from "./notification-recipient-query-repository"

describe("buildGroupMembershipSelectionFilter", () => {
  const currentTime = new Date("2026-09-14T12:00:00.000Z")

  it("selects only memberships active at the current time", () => {
    const filter = buildGroupMembershipSelectionFilter(currentTime, false)

    expect(filter).toEqual({
      start: {
        lte: currentTime,
      },
      OR: [{ end: null }, { end: { gt: currentTime } }],
    })
  })

  it("includes former memberships but excludes future memberships", () => {
    const filter = buildGroupMembershipSelectionFilter(currentTime, true)

    expect(filter).toEqual({
      start: {
        lte: currentTime,
      },
    })
  })
})
