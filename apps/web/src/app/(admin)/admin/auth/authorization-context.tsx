"use client"

import { useSimulatedAuthorization } from "@admin/opptak/ForTestingRoleSimulation"
import {
  canEditApplication,
  canEditApplicationGroupAvailability,
  canManageApplicationInterviews,
  canViewApplication,
  canViewApplicationGroup,
  canViewApplicationMatching,
  isApplicationGroupMember,
} from "./permissions"
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

const AuthorizationContext = createContext<ReturnType<typeof createAuthorization> | null>(null)

function createAuthorization(state: Authorization) {
  return {
    ...state,
    canViewApplication: () => canViewApplication(state),
    canManageApplicationInterviews: () => canManageApplicationInterviews(state),
    canViewApplicationMatching: () => canViewApplicationMatching(state),
    canEditApplicationGroupAvailability: (groupId: GroupId) => canEditApplicationGroupAvailability(state, groupId),
    canViewApplicationGroup: (groupId: GroupId) => canViewApplicationGroup(state, groupId),
    isApplicationGroupMember: (groupId: GroupId) => isApplicationGroupMember(state, groupId),
    canEditApplication: () => canEditApplication(state),
  }
}

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
  const simulatedAuthorization = useSimulatedAuthorization()
  const effectiveAffiliations = simulatedAuthorization?.affiliations ?? affiliations
  const value = useMemo(() => {
    const affiliationsMap = toAffiliationsMap(effectiveAffiliations)

    return createAuthorization({
      subject,
      affiliations: affiliationsMap,
      groups: toGroupTypeMap(groups),
      isAdministrator: simulatedAuthorization?.isAdministrator ?? isAdministratorAffiliation(affiliationsMap),
      isCommitteeMember: simulatedAuthorization?.isCommitteeMember ?? isCommitteeMemberAffiliation(affiliationsMap),
    })
  }, [effectiveAffiliations, groups, subject, simulatedAuthorization])

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
}

export function useAuthorization() {
  const context = useContext(AuthorizationContext)

  if (context === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return context
}
