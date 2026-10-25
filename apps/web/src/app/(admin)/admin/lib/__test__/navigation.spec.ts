import type { useAuthorization } from "@admin/auth/authorization-context"
import { filterNavigationsUserHasAccessTo, navigations } from "@admin/lib/navigation"
import type { GroupId, GroupRoleType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
import { describe, expect, it } from "vitest"

function principal(affiliations: Record<string, GroupRoleType[]>): ReturnType<typeof useAuthorization> {
  const affiliationMap = new Map<GroupId, Set<GroupRoleType>>()
  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationMap.set(groupId, new Set(roles))
  }

  return {
    affiliations: affiliationMap,
    isAdministrator: false,
    isCommitteeMember: false,
    canCreateGroup: () => true,
    canEditFadderuke: () => true,
  } as unknown as ReturnType<typeof useAuthorization>
}

function auth(overrides: Partial<ReturnType<typeof useAuthorization>> = {}) {
  return {
    affiliations: new Map<GroupId, Set<GroupRoleType>>(),
    canCreateGroup: () => true,
    canEditFadderuke: () => true,
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
  it("hides create event when the caller has no affiliations", () => {
    expect(actionHrefs(principal({}))).not.toContain("/admin/arrangementer/ny")
    expect(pageHrefs(principal({}))).toContain("/admin/arrangementer")
  })

  it("keeps create event when the caller has an affiliation", () => {
    expect(actionHrefs(principal({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).toContain("/admin/arrangementer/ny")
  })

  it("hides create group when canCreateGroup is false", () => {
    expect(actionHrefs(auth({ canCreateGroup: () => false }))).not.toContain("/admin/grupper/ny")
  })

  it("hides offline when the caller is not affiliated with Redaksjonen", () => {
    expect(pageHrefs(principal({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).not.toContain("/admin/offline")
  })

  it("keeps offline when the caller is leader of Redaksjonen", () => {
    expect(pageHrefs(principal({ redaksjonen: [GroupRoleTypeEnum.LEADER] }))).toContain("/admin/offline")
  })

  it("hides fadderukene when canEditFadderuke is false", () => {
    expect(pageHrefs(auth({ canEditFadderuke: () => false }))).not.toContain("/admin/fadderukene")
  })

  it("hides audit log when the caller is not an administrator", () => {
    expect(pageHrefs(principal({ arrkom: [GroupRoleTypeEnum.COSMETIC] }))).not.toContain("/admin/logg")
  })

  it("keeps audit log when the caller is an administrator", () => {
    expect(pageHrefs(principal({ dotkom: [GroupRoleTypeEnum.COSMETIC] }))).toContain("/admin/logg")
  })
})
