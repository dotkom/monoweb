"use client"

import type { GroupId, GroupRoleType } from "@dotkomonline/rpc/group"
import { createContext, useContext, useMemo } from "react"
import type { PropsWithChildren } from "react"

export interface AuthorizationProviderProps {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Record<GroupId, GroupRoleType[]>
}

interface AuthorizationContextValue {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Map<GroupId, Set<GroupRoleType>>
}

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null)

function toAffiliationsMap(affiliations: Record<GroupId, GroupRoleType[]>) {
  const affiliationsMap = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationsMap.set(groupId, new Set(roles))
  }

  return affiliationsMap
}

export function AuthorizationProvider({
  children,
  isAdministrator,
  isCommitteeMember,
  affiliations,
}: PropsWithChildren<AuthorizationProviderProps>) {
  const value = useMemo(
    () => ({
      isAdministrator,
      isCommitteeMember,
      affiliations: toAffiliationsMap(affiliations),
    }),
    [affiliations, isAdministrator, isCommitteeMember]
  )

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export function useAuthorization() {
  const context = useContext(AuthorizationContext)

  if (context === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return useMemo(
    () => ({
      isAdministrator: context.isAdministrator,
      isCommitteeMember: context.isCommitteeMember,
      affiliations: context.affiliations,
      // UI helpers treat administrators as having all group memberships and roles, so there might not always be parity.
      isGroupMember: (groupId: GroupId) => context.isAdministrator || context.affiliations.has(groupId),
      hasGroupRole: (groupId: GroupId, role: GroupRoleType) =>
        context.isAdministrator || (context.affiliations.get(groupId)?.has(role) ?? false),
    }),
    [context]
  )
}
