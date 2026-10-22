"use client"

import type { GroupId, GroupRoleType, GroupType } from "@dotkomonline/rpc/group"
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
  groups: Record<GroupId, GroupType>
}

export type Authorization = AffiliatedPrincipalWithSubject & {
  isAdministrator: boolean
  isCommitteeMember: boolean
  groups: Map<GroupId, GroupType>
}

const AuthorizationContext = createContext<Authorization | null>(null)

function toAffiliationsMap(affiliations: Record<GroupId, GroupRoleType[]>): Map<GroupId, Set<GroupRoleType>> {
  const affiliationsMap = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationsMap.set(groupId, new Set(roles))
  }

  return affiliationsMap
}

function toGroupTypeMap(groups: Record<GroupId, GroupType>): Map<GroupId, GroupType> {
  return new Map(Object.entries(groups))
}

export function AuthorizationProvider({
  children,
  subject,
  affiliations,
  groups,
}: PropsWithChildren<AuthorizationProviderProps>) {
  const value = useMemo(() => {
    const affiliationsMap = toAffiliationsMap(affiliations)

    return {
      subject,
      affiliations: affiliationsMap,
      groups: toGroupTypeMap(groups),
      isAdministrator: isAdministratorAffiliation(affiliationsMap),
      isCommitteeMember: isCommitteeMemberAffiliation(affiliationsMap),
    } satisfies Authorization
  }, [affiliations, groups, subject])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export function useAuthorization(): Authorization {
  const context = useContext(AuthorizationContext)

  if (context === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return context
}
