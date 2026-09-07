import { describe, expect, it } from "vitest"
import {
  buildAllUsersSelectionFilter,
  buildAttendeeSelectionFilter,
  buildGroupMembershipSelectionFilter,
} from "./notification-recipient-query-repository"

const paidAttendeePaymentConditions = [
  { paymentChargedAt: { not: null } },
  { paymentReservedAt: { not: null } },
  {
    AND: [{ paymentRefundedAt: { not: null } }, { paymentDeadline: null }],
  },
]

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

describe("buildAttendeeSelectionFilter", () => {
  it("selects reserved attendees without extra filters", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
      attendanceSelectionOptions: undefined,
    })

    expect(filter).toEqual({
      reserved: true,
    })
  })

  it("does not constrain reservation status when all attendees are included", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "ALL",
      paymentStatus: "ALL",
      attendanceSelectionOptions: undefined,
    })

    expect(filter).toEqual({})
  })

  it("selects unreserved attendees", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "UNRESERVED",
      paymentStatus: "ALL",
      attendanceSelectionOptions: undefined,
    })

    expect(filter).toEqual({
      reserved: false,
    })
  })

  it("filters paid attendees", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "RESERVED",
      paymentStatus: "PAID",
      attendanceSelectionOptions: undefined,
    })

    expect(filter).toEqual({
      reserved: true,
      OR: paidAttendeePaymentConditions,
    })
  })

  it("filters unpaid attendees", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "RESERVED",
      paymentStatus: "UNPAID",
      attendanceSelectionOptions: undefined,
    })

    expect(filter).toEqual({
      reserved: true,
      NOT: {
        OR: paidAttendeePaymentConditions,
      },
    })
  })

  it("filters attendees who selected any of the given options", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
      attendanceSelectionOptions: [
        { selectionId: "selection-1", optionId: "option-1" },
        { selectionId: "selection-2", optionId: "option-2" },
      ],
    })

    expect(filter).toEqual({
      reserved: true,
      OR: [
        {
          selections: {
            array_contains: [{ selectionId: "selection-1", optionId: "option-1" }],
          },
        },
        {
          selections: {
            array_contains: [{ selectionId: "selection-2", optionId: "option-2" }],
          },
        },
      ],
    })
  })

  it("combines payment and selection filters", () => {
    const filter = buildAttendeeSelectionFilter({
      reservationStatus: "RESERVED",
      paymentStatus: "PAID",
      attendanceSelectionOptions: [{ selectionId: "selection-1", optionId: "option-1" }],
    })

    expect(filter).toEqual({
      reserved: true,
      AND: [
        {
          OR: paidAttendeePaymentConditions,
        },
        {
          OR: [
            {
              selections: {
                array_contains: [{ selectionId: "selection-1", optionId: "option-1" }],
              },
            },
          ],
        },
      ],
    })
  })
})

describe("buildAllUsersSelectionFilter", () => {
  const currentTime = new Date("2026-09-14T12:00:00.000Z")
  const activeDateRangeFilter = {
    start: {
      lte: currentTime,
    },
    OR: [{ end: null }, { end: { gt: currentTime } }],
  }

  it("does not constrain users when no filters are selected", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: undefined,
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({})
  })

  it("selects users with an active membership", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ACTIVE",
      membershipTypes: undefined,
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      memberships: {
        some: activeDateRangeFilter,
      },
    })
  })

  it("selects users with the given membership types", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: ["BACHELOR_STUDENT", "MASTER_STUDENT"],
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      memberships: {
        some: {
          type: {
            in: ["BACHELOR_STUDENT", "MASTER_STUDENT"],
          },
        },
      },
    })
  })

  it("selects users with no membership", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: ["NONE"],
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      memberships: {
        none: {},
      },
    })
  })

  it("selects users with no active membership", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ACTIVE",
      membershipTypes: ["NONE"],
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      memberships: {
        none: activeDateRangeFilter,
      },
    })
  })

  it("selects users with a matching membership type or no membership", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: ["BACHELOR_STUDENT", "NONE"],
      studyGrades: undefined,
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      OR: [
        {
          memberships: {
            some: {
              type: {
                in: ["BACHELOR_STUDENT"],
              },
            },
          },
        },
        {
          memberships: {
            none: {},
          },
        },
      ],
    })
  })

  it("selects users in the given study grades", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: undefined,
      studyGrades: [1, 3],
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      memberships: {
        some: {
          semester: {
            in: [0, 1, 4, 5],
          },
        },
      },
    })
  })

  it("applies study grades only to matching memberships when NONE is included", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: ["BACHELOR_STUDENT", "NONE"],
      studyGrades: [1, 3],
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      OR: [
        {
          memberships: {
            some: {
              type: {
                in: ["BACHELOR_STUDENT"],
              },
              semester: {
                in: [0, 1, 4, 5],
              },
            },
          },
        },
        {
          memberships: {
            none: {},
          },
        },
      ],
    })
  })

  it("selects users in the given study grades or with no membership", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: ["NONE"],
      studyGrades: [1, 3],
      requiresActiveCommitteeMembership: false,
    })

    expect(filter).toEqual({
      OR: [
        {
          memberships: {
            some: {
              semester: {
                in: [0, 1, 4, 5],
              },
            },
          },
        },
        {
          memberships: {
            none: {},
          },
        },
      ],
    })
  })

  it("selects users who are active committee members", () => {
    const filter = buildAllUsersSelectionFilter(currentTime, {
      membershipStatus: "ALL",
      membershipTypes: undefined,
      studyGrades: undefined,
      requiresActiveCommitteeMembership: true,
    })

    expect(filter).toEqual({
      groupMemberships: {
        some: {
          start: {
            lte: currentTime,
          },
          OR: [{ end: null }, { end: { gt: currentTime } }],
          group: {
            type: {
              in: ["COMMITTEE", "NODE_COMMITTEE"],
            },
          },
        },
      },
    })
  })
})
