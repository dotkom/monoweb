"use client"

import type { GroupId, GroupRoleType } from "@dotkomonline/rpc/group"
import {
  isAdministrator as isAdministratorAffiliation,
  isCommitteeMember as isCommitteeMemberAffiliation,
  type AffiliatedPrincipalWithSubject,
} from "@dotkomonline/rpc/permissions"
import type { UserId } from "@dotkomonline/rpc/user"
import type { PropsWithChildren } from "react"
import { createContext, useContext, useMemo } from "react"

export interface AuthorizationProviderProps {
  subject: UserId
  affiliations: Record<GroupId, GroupRoleType[]>
}

export type Authorization = AffiliatedPrincipalWithSubject & {
  isAdministrator: boolean
  isCommitteeMember: boolean
}

const AuthorizationContext = createContext<Authorization | null>(null)

function toAffiliationsMap(affiliations: Record<GroupId, GroupRoleType[]>): Map<GroupId, Set<GroupRoleType>> {
  const affiliationsMap = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationsMap.set(groupId, new Set(roles))
  }

  return affiliationsMap
}

export function AuthorizationProvider({
  children,
  subject,
  affiliations,
}: PropsWithChildren<AuthorizationProviderProps>) {
  const value = useMemo(() => {
    const affiliationsMap = toAffiliationsMap(affiliations)

    return {
      subject,
      affiliations: affiliationsMap,
      isAdministrator: isAdministratorAffiliation(affiliationsMap),
      isCommitteeMember: isCommitteeMemberAffiliation(affiliationsMap),
    } satisfies Authorization
  }, [affiliations, subject])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export function useAuthorization(): Authorization {
  const context = useContext(AuthorizationContext)

  if (context === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return context
}
