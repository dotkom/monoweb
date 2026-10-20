import { canAccessAuditLog } from "@dotkomonline/rpc/audit-log-permissions"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import {
  canCreateEvent,
  canCreateEvents,
  canEditEvent,
  canSetEventOrganizers,
} from "@dotkomonline/rpc/event-permissions"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
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

    expect(canEditEvent(state, ["arrkom"])).toBe(true)
  })

  it("denies editing for unrelated committee members", () => {
    const state = createState({ bedkom: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["arrkom"])).toBe(false)
  })

  it("allows editing when the user hosts via a committee even if interest groups are also organizers", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("ignores interest-group-only organizers for edit permission", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canEditEvent(state, ["some-interest-group"])).toBe(false)
  })
})

describe("canSetEventOrganizers", () => {
  it("allows creating with committees the user belongs to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "some-interest-group"])).toBe(true)
  })

  it("denies creating with a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canCreateEvent(state, ["backlog", "arrkom"])).toBe(false)
  })

  it("allows a co-host to keep existing organizers unchanged", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom"], ["backlog", "arrkom"])).toBe(true)
  })

  it("allows a co-host to add an interest group without belonging to every committee host", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom", "some-interest-group"], ["backlog", "arrkom"])).toBe(true)
  })

  it("denies adding a committee the user does not belong to", () => {
    const state = createState({ backlog: [GroupRoleTypeEnum.LEADER] })

    expect(canSetEventOrganizers(state, ["backlog", "arrkom", "bedkom"], ["backlog", "arrkom"])).toBe(false)
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
  it("allows committee members", () => {
    expect(canManageCompanies(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies callers with no committee affiliations", () => {
    expect(canManageCompanies(createState({}))).toBe(false)
  })
})

describe("canManageJobListings", () => {
  it("allows committee members", () => {
    expect(canManageJobListings(createState({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toBe(true)
  })

  it("denies callers with no committee affiliations", () => {
    expect(canManageJobListings(createState({}))).toBe(false)
  })
})
