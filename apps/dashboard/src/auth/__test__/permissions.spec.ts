import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
import { describe, expect, it } from "vitest"
import {
  canAccessAuditLog,
  canCreateEvents,
  canEditEvent,
  canEditFadderuke,
  canEditOffline,
  canEditUserProfile,
  canManageGroupMembership,
  canManageNotifications,
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

    expect(canEditEvent(state, ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"])).toBe(false)
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
  it("allows prokom editors", () => {
    const state = createState({ prokom: [GroupRoleTypeEnum.EDITOR_IN_CHIEF] })

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

describe("canManageNotifications", () => {
  it("requires committee membership", () => {
    expect(
      canManageNotifications(
        createAuthorizationState({
          isAdministrator: false,
          isCommitteeMember: false,
          affiliations: { arrkom: [GroupRoleTypeEnum.COSMETIC] },
        })
      )
    ).toBe(false)

    expect(
      canManageNotifications(
        createAuthorizationState({
          isAdministrator: false,
          isCommitteeMember: true,
          affiliations: { arrkom: [GroupRoleTypeEnum.COSMETIC] },
        })
      )
    ).toBe(true)
  })
})
