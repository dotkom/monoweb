import type { useAuthorization } from "@/auth/authorization-context"
import { filterNavigationsUserHasAccessTo, navigations } from "@/lib/navigation"
import { describe, expect, it } from "vitest"

function auth(overrides: Partial<ReturnType<typeof useAuthorization>> = {}) {
  return {
    canCreateEvents: () => true,
    canCreateGroup: () => true,
    canEditOffline: () => true,
    canEditFadderuke: () => true,
    canAccessAuditLog: () => true,
    ...overrides,
  } as ReturnType<typeof useAuthorization>
}

function actionHrefs(authorization: ReturnType<typeof useAuthorization>) {
  return filterNavigationsUserHasAccessTo(navigations, authorization).flatMap(
    (page) => page.createActions?.map((action) => action.href) ?? []
  )
}

function pageHrefs(authorization: ReturnType<typeof useAuthorization>) {
  return filterNavigationsUserHasAccessTo(navigations, authorization).map((page) => page.href)
}

describe("filterNavigationsUserHasAccessTo", () => {
  it("hides create event when canCreateEvents is false", () => {
    expect(actionHrefs(auth({ canCreateEvents: () => false }))).not.toContain("/arrangementer/ny")
    expect(pageHrefs(auth({ canCreateEvents: () => false }))).toContain("/arrangementer")
  })

  it("keeps create event when canCreateEvents is true", () => {
    expect(actionHrefs(auth())).toContain("/arrangementer/ny")
  })

  it("hides create group when canCreateGroup is false", () => {
    expect(actionHrefs(auth({ canCreateGroup: () => false }))).not.toContain("/grupper/ny")
  })

  it("hides offline when canEditOffline is false", () => {
    expect(pageHrefs(auth({ canEditOffline: () => false }))).not.toContain("/offline")
  })

  it("hides fadderukene when canEditFadderuke is false", () => {
    expect(pageHrefs(auth({ canEditFadderuke: () => false }))).not.toContain("/fadderukene")
  })

  it("hides audit log when canAccessAuditLog is false", () => {
    expect(pageHrefs(auth({ canAccessAuditLog: () => false }))).not.toContain("/logg")
  })
})
