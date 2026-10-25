import { canAccessAuditLog } from "@dotkomonline/rpc/audit-log-permissions"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import { canCreateContest, canCreateContests, canManageContest } from "@dotkomonline/rpc/contest-permissions"
import { canCreateEvent, canCreateEvents, canEditEvent } from "@dotkomonline/rpc/event-permissions"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum, GroupTypeSchema } from "@dotkomonline/rpc/group"
import { canManageJobListings } from "@dotkomonline/rpc/job-listing-permissions"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"
import { describe, expect, it } from "vitest"
import {
  canEditUserProfile,
  canManageGroupMembership,
  canManageNotification,
  createAuthorizationState,
  hasAnyGroupAffiliation,
} from "../permissions"

function createState(affiliations: Record<string, GroupRoleType[]>, options: { isAdministrator?: boolean } = {}) {
  return createAuthorizationState({
    isAdministrator: options.isAdministrator ?? false,
    isCommitteeMember: true,
    affiliations,
  })
}

describe("hasAnyGroupAffiliation", () => {
  it("returns true when user shares a hosting group", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["arrkom"])).toBe(true)
  })

  it("returns false when user has no overlapping groups", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["dotkom"])).toBe(false)
  })

  it("returns true for administrators regardless of affiliations", () => {
    const state = createState({}, { isAdministrator: true })

    expect(hasAnyGroupAffiliation(state, ["dotkom"])).toBe(true)
  })

  it("returns true for dotkom members acting on any group", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(hasAnyGroupAffiliation(state, ["arrkom"])).toBe(true)
  })
})

describe("canEditEvent", () => {
  it("allows editing when user hosts the event", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"], ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"], ["arrkom"])).toBe(false)
  })

  it("allows editing when the user hosts via a committee even if interest groups are also organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "some-interest-group"], ["backlog", "some-interest-group"])).toBe(true)
  })

  it("ignores interest-group-only organizers for edit permission", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["some-interest-group"], ["some-interest-group"])).toBe(false)
  })

  it("allows a co-host to add another committee they are not in", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "arrkom"], ["backlog", "arrkom", "bedkom"])).toBe(true)
  })

  it("denies a non-host from editing even if they appear in the next organizers", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"], ["arrkom", "bedkom"])).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, [], [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, [], [])).toBe(true)
  })
})

describe("canCreateEvent", () => {
  it("allows creating when the user belongs to at least one committee organizer", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "some-interest-group"])).toBe(true)
    expect(canCreateEvent(state, ["backlog", "arrkom"])).toBe(true)
  })

  it("denies creating when the user belongs to none of the committee organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["arrkom"])).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, [])).toBe(true)
  })
})

describe("canManageNotification", () => {
  it("allows members of the sending group to manage the notification", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, "arrkom")).toBe(true)
  })

  it("denies management for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, "arrkom")).toBe(false)
  })

  it("allows administrators to manage notifications from any group", () => {
    const state = createState({}, { isAdministrator: true })

    expect(canManageNotification(state, "arrkom")).toBe(true)
  })

  it("allows administrators to manage system notifications", () => {
    const state = createState({}, { isAdministrator: true })

    expect(canManageNotification(state, null)).toBe(true)
  })

  it("denies system notifications for non-administrators", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageNotification(state, null)).toBe(false)
  })
})

describe("canAccessAuditLog", () => {
  it("is limited to administrators", () => {
    expect(canAccessAuditLog(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canAccessAuditLog(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
  })
})

describe("canEditUserProfile", () => {
  it("allows administrators to edit any user", () => {
    const state = createState({}, { isAdministrator: true })

    expect(canEditUserProfile(state, "user-1", "user-2")).toBe(true)
  })

  it("allows users to edit their own profile", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserProfile(state, "user-1", "user-1")).toBe(true)
  })

  it("denies editing other users for non-administrators", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditUserProfile(state, "user-1", "user-2")).toBe(false)
    expect(canEditUserProfile(state, "user-1", null)).toBe(false)
  })
})

describe("canManageOfflines", () => {
  it("allows redaksjonen leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("allows redaksjonen deputy leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.DEPUTY_LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("allows administrators", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(true)
  })

  it("denies unrelated committee members", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageOfflines(state)).toBe(false)
  })
})

describe("canManageFadderuker", () => {
  it("allows velkom members", () => {
    const state = createState({ velkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageFadderuker(state)).toBe(true)
  })

  it("allows administrators", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageFadderuker(state)).toBe(true)
  })

  it("denies unrelated committee members", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageFadderuker(state)).toBe(false)
  })
})

describe("canManageGroupMembership", () => {
  it("allows leaders to manage committee groups", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageGroupMembership(state, "arrkom", false)).toBe(true)
  })

  it("allows backlog to manage interest groups", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.COSMETIC] })

    expect(canManageGroupMembership(state, "some-interest-group", true)).toBe(true)
  })
})

describe("canCreateEvents", () => {
  it("requires at least one affiliation for non-admins", () => {
    expect(canCreateEvents(createState({}))).toBe(false)
    expect(canCreateEvents(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateEvents(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })
})

describe("canManageCompanies", () => {
  it("allows bedkom and fagkom members", () => {
    expect(canManageCompanies(createState({ bedkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canManageCompanies(createState({ fagkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("allows administrators", () => {
    expect(canManageCompanies(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies unrelated committee members", () => {
    expect(canManageCompanies(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
  })
})

describe("canManageJobListings", () => {
  it("allows bedkom", () => {
    expect(canManageJobListings(createState({ bedkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("allows administrators", () => {
    expect(canManageJobListings(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies unrelated committee members", () => {
    expect(canManageJobListings(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
  })
})

describe("canCreateContests", () => {
  it("requires at least one affiliation for non-admins", () => {
    expect(canCreateContests(createState({}))).toBe(false)
    expect(canCreateContests(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
    expect(canCreateContests(createState({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })
})

describe("canManageContest", () => {
  it("allows editing when user hosts the contest", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(false)
  })

  it("allows a co-host to add another committee they are not in", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canManageContest(
        state,
        [
          { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        ],
        [
          { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE },
        ]
      )
    ).toBe(true)
  })

  it("denies a non-host from editing even if they appear in the next organizers", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(
      canManageContest(
        state,
        [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }],
        [
          { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
          { slug: "bedkom", type: GroupTypeSchema.enum.COMMITTEE },
        ]
      )
    ).toBe(false)
  })

  it("allows backlog to manage contests with interest-group organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      true
    )
    expect(
      canManageContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(true)
  })

  it("denies non-backlog committees from managing contests with interest-group organizers", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      false
    )
    expect(
      canManageContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageContest(state, [])).toBe(true)
  })
})

describe("canCreateContest", () => {
  it("allows creating when the user belongs to at least one committee organizer", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(
      canCreateContest(state, [
        { slug: "backlog", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
      ])
    ).toBe(true)
  })

  it("denies creating when the user belongs to none of the committee organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE }])).toBe(false)
  })

  it("allows backlog to create contests with interest-group organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      true
    )
    expect(
      canCreateContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(true)
  })

  it("denies non-backlog committees from creating contests with interest-group organizers", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [{ slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP }])).toBe(
      false
    )
    expect(
      canCreateContest(state, [
        { slug: "arrkom", type: GroupTypeSchema.enum.COMMITTEE },
        { slug: "some-interest-group", type: GroupTypeSchema.enum.INTEREST_GROUP },
      ])
    ).toBe(false)
  })

  it("denies non-admins when organizers are empty", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [])).toBe(false)
  })

  it("allows administrators when organizers are empty", () => {
    const state = createState({ dotkom: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateContest(state, [])).toBe(true)
  })
})
