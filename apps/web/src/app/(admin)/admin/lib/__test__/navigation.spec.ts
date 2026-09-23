import type { useAuthorization } from "@admin/auth/authorization-context"
import { filterNavigationsUserHasAccessTo, navigations } from "@admin/lib/navigation"
import { describe, expect, it } from "vitest"

type Authorization = ReturnType<typeof useAuthorization>

const allowAll: Authorization = {
  isAdministrator: true,
  isCommitteeMember: true,
  affiliations: new Map(),
  isGroupMember: () => true,
  hasGroupRole: () => true,
  hasAnyGroupAffiliation: () => true,
  canAccessAuditLog: () => true,
  canManageUserMemberships: () => true,
  canEditUserProfile: () => true,
  canEditEvent: () => true,
  canEditContest: () => true,
  canManageNotification: () => true,
  canEditOffline: () => true,
  canEditFadderuke: () => true,
  canViewApplication: () => true,
  canManageApplicationInterviews: () => true,
  canViewApplicationMatching: () => true,
  canEditApplicationGroupAvailability: () => true,
  canViewApplicationGroup: () => true,
  isApplicationGroupMember: () => true,
  canEditApplication: () => true,
  canCreateGroup: () => true,
  canUpdateGroup: () => true,
  canDeleteGroup: () => true,
  canManageGroupMembership: () => true,
  canManageGroupRoles: () => true,
  canCreateEvents: () => true,
}

function auth(overrides: Partial<Authorization> = {}): Authorization {
  return { ...allowAll, ...overrides }
}

function actionHrefs(authorization: Authorization) {
  return filterNavigationsUserHasAccessTo(navigations, authorization).flatMap(
    (page) => page.createActions?.map((action) => action.href) ?? []
  )
}

function pageHrefs(authorization: Authorization) {
  return filterNavigationsUserHasAccessTo(navigations, authorization).map((page) => page.href)
}

describe("filterNavigationsUserHasAccessTo", () => {
  it("hides create event when canCreateEvents is false", () => {
    expect(actionHrefs(auth({ canCreateEvents: () => false }))).not.toContain("/admin/arrangementer/ny")
    expect(pageHrefs(auth({ canCreateEvents: () => false }))).toContain("/admin/arrangementer")
  })

  it("keeps create event when canCreateEvents is true", () => {
    expect(actionHrefs(auth())).toContain("/admin/arrangementer/ny")
  })

  it("hides create group when canCreateGroup is false", () => {
    expect(actionHrefs(auth({ canCreateGroup: () => false }))).not.toContain("/admin/grupper/ny")
  })

  it("hides offline when canEditOffline is false", () => {
    expect(pageHrefs(auth({ canEditOffline: () => false }))).not.toContain("/admin/offline")
  })

  it("hides fadderukene when canEditFadderuke is false", () => {
    expect(pageHrefs(auth({ canEditFadderuke: () => false }))).not.toContain("/admin/fadderukene")
  })

  it("hides audit log when canAccessAuditLog is false", () => {
    expect(pageHrefs(auth({ canAccessAuditLog: () => false }))).not.toContain("/admin/logg")
  })

  it("hides komitéopptak when canViewApplication is false", () => {
    expect(pageHrefs(auth({ canViewApplication: () => false }))).not.toContain("/admin/opptak")
  })

  it("hides create komitéopptak when canEditApplication is false", () => {
    expect(actionHrefs(auth({ canEditApplication: () => false }))).not.toContain("/admin/opptak/ny")
    expect(pageHrefs(auth({ canEditApplication: () => false }))).toContain("/admin/opptak")
  })
})
