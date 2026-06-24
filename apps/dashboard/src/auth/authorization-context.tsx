"use client"

import type { GroupId, GroupRoleType } from "@dotkomonline/types"
import { createContext, useContext, useMemo } from "react"
import type { PropsWithChildren } from "react"

interface AuthorizationContextValue {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Map<GroupId, Set<GroupRoleType>>
}

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null)

export function AuthorizationProvider({ children, ...value }: PropsWithChildren<AuthorizationContextValue>) {
  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export function useAuthorization() {
  const ctx = useContext(AuthorizationContext)

  if (ctx === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return useMemo(
    () => ({
      isAdministrator: ctx.isAdministrator,
      isCommitteeMember: ctx.isCommitteeMember,
      affiliations: ctx.affiliations,
      isGroupMember: (groupId: GroupId) => ctx.isAdministrator || ctx.affiliations.has(groupId),
      hasGroupRole: (groupId: GroupId, role: GroupRoleType) =>
        ctx.isAdministrator || (ctx.affiliations.get(groupId)?.has(role) ?? false),
    }),
    [ctx]
  )
}
