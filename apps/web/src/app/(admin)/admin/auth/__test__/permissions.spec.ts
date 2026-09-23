import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
import { describe, expect, it } from "vitest"
import {
  canAccessAuditLog,
  canCreateEvents,
  canEditApplication,
  canEditApplicationGroupAvailability,
  canEditEvent,
  canManageApplicationInterviews,
  canManageNotification,
  canEditFadderuke,
  canEditOffline,
  canEditUserProfile,
  canManageGroupMembership,
  canViewApplication,
  canViewApplicationGroup,
  canViewApplicationMatching,
  createAuthorizationState,
  hasAnyGroupAffiliation,
  isApplicationGroupMember,
} from "../permissions"

function createState(
  affiliations: Record<string, GroupRoleType[]>,
  options: { isAdministrator?: boolean; isCommitteeMember?: boolean } = {}
) {
  return createAuthorizationState({
    isAdministrator: options.isAdministrator ?? false,
    isCommitteeMember: options.isCommitteeMember ?? true,
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

    expect(canEditEvent(state, ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"])).toBe(false)
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
    expect(canAccessAuditLog(createState({ dotkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
    expect(canAccessAuditLog(createState({}, { isAdministrator: true }))).toBe(true)
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

describe("canEditOffline", () => {
  it("allows redaksjonen leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.LEADER] })

    expect(canEditOffline(state)).toBe(true)
  })

  it("allows redaksjonen deputy leaders", () => {
    const state = createState({ redaksjonen: [GroupRoleTypeEnum.DEPUTY_LEADER] })

    expect(canEditOffline(state)).toBe(true)
  })

  it("denies unrelated committee members", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditOffline(state)).toBe(false)
  })
})

describe("canEditFadderuke", () => {
  it("allows velkom members", () => {
    const state = createState({ velkom: [GroupRoleTypeEnum.COSMETIC] })

    expect(canEditFadderuke(state)).toBe(true)
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
    expect(canCreateEvents(createState({}, { isAdministrator: true }))).toBe(true)
  })
})

describe("canViewApplication", () => {
  it("allows any committee member", () => {
    expect(canViewApplication(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("allows administrators", () => {
    expect(canViewApplication(createState({}, { isAdministrator: true }))).toBe(true)
  })

  it("denies users without committee membership", () => {
    expect(canViewApplication(createState({}, { isCommitteeMember: false }))).toBe(false)
  })
})

describe("canViewApplicationGroup", () => {
  it("allows members of that committee", () => {
    expect(canViewApplicationGroup(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }), "arrkom")).toBe(true)
  })

  it("denies members of other committees", () => {
    expect(canViewApplicationGroup(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }), "bedkom")).toBe(false)
  })

  it("allows administrators for any committee", () => {
    expect(canViewApplicationGroup(createState({}, { isAdministrator: true }), "bedkom")).toBe(true)
  })
})

describe("isApplicationGroupMember", () => {
  it("allows members of that committee", () => {
    expect(isApplicationGroupMember(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }), "arrkom")).toBe(true)
  })

  it("denies members of other committees", () => {
    expect(isApplicationGroupMember(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }), "bedkom")).toBe(false)
  })

  it("denies administrators without an affiliation, unlike the other application permissions", () => {
    expect(isApplicationGroupMember(createState({}, { isAdministrator: true }), "arrkom")).toBe(false)
  })
})

describe("canViewApplicationMatching", () => {
  it("is limited to administrators", () => {
    expect(canViewApplicationMatching(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
    expect(canViewApplicationMatching(createState({}, { isAdministrator: true }))).toBe(true)
  })
})

describe("canManageApplicationInterviews", () => {
  it("allows leaders and deputy leaders of any committee", () => {
    expect(canManageApplicationInterviews(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(true)
    expect(canManageApplicationInterviews(createState({ arrkom: [GroupRoleTypeEnum.DEPUTY_LEADER] }))).toBe(true)
  })

  it("denies committee members without a leader role", () => {
    expect(canManageApplicationInterviews(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(false)
  })

  it("allows administrators", () => {
    expect(canManageApplicationInterviews(createState({}, { isAdministrator: true }))).toBe(true)
  })
})

describe("canEditApplicationGroupAvailability", () => {
  it("allows the leader and deputy leader of that committee", () => {
    expect(canEditApplicationGroupAvailability(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }), "arrkom")).toBe(
      true
    )
    expect(
      canEditApplicationGroupAvailability(createState({ arrkom: [GroupRoleTypeEnum.DEPUTY_LEADER] }), "arrkom")
    ).toBe(true)
  })

  it("denies a leader of another committee, unlike canManageApplicationInterviews", () => {
    const state = createState({ arrkom: [GroupRoleTypeEnum.LEADER] })

    expect(canManageApplicationInterviews(state)).toBe(true)
    expect(canEditApplicationGroupAvailability(state, "bedkom")).toBe(false)
  })

  it("denies ordinary members of that committee", () => {
    expect(canEditApplicationGroupAvailability(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }), "arrkom")).toBe(
      false
    )
  })

  it("allows administrators for any committee", () => {
    expect(canEditApplicationGroupAvailability(createState({}, { isAdministrator: true }), "bedkom")).toBe(true)
  })
})

describe("canEditApplication", () => {
  it("is limited to administrators", () => {
    expect(canEditApplication(createState({ arrkom: [GroupRoleTypeEnum.LEADER] }))).toBe(false)
    expect(canEditApplication(createState({}, { isAdministrator: true }))).toBe(true)
  })
})
