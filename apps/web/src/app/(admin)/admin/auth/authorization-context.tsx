"use client"

import type { GroupId, GroupRoleType, GroupType } from "@dotkomonline/rpc/group"
import {
  isAdministrator as isAdministratorAffiliation,
  isCommitteeMember as isCommitteeMemberAffiliation,
  type AffiliatedPrincipalWithSubject,
} from "@dotkomonline/rpc/permissions"
import type { UserId } from "@dotkomonline/rpc/user"
import { createContext, useContext, useMemo } from "react"
import type { PropsWithChildren } from "react"
import type { AuthorizationState } from "./permissions"
import {
  canAccessAuditLog,
  canCreateEvents,
  canCreateGroup,
  canDeleteGroup,
  canEditContest,
  canEditEvent,
  canEditFadderuke,
  canEditOffline,
  canEditUserProfile,
  canManageNotification,
  canManageGroupMembership,
  canManageGroupRoles,
  canManageUserMemberships,
  canUpdateGroup,
  hasAnyGroupAffiliation,
  hasGroupRole,
  isGroupMember,
} from "./permissions"

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

export function useAuthorization() {
  const context = useContext(AuthorizationContext)

  if (context === null) {
    throw new Error("useAuthorization must be used within AuthorizationProvider")
  }

  return useMemo(() => {
    const state: AuthorizationState = {
      isAdministrator: context.isAdministrator,
      isCommitteeMember: context.isCommitteeMember,
      affiliations: context.affiliations,
    }

    return {
      subject: context.subject,
      isAdministrator: context.isAdministrator,
      isCommitteeMember: context.isCommitteeMember,
      affiliations: context.affiliations,
      groups: context.groups,
      isGroupMember: (groupId: GroupId) => isGroupMember(state, groupId),
      hasGroupRole: (groupId: GroupId, role: GroupRoleType) => hasGroupRole(state, groupId, role),
      hasAnyGroupAffiliation: (groupIds: readonly GroupId[]) => hasAnyGroupAffiliation(state, groupIds),
      canAccessAuditLog: () => canAccessAuditLog(state),
      canManageUserMemberships: () => canManageUserMemberships(state),
      canEditUserProfile: (userId: UserId) => canEditUserProfile(state, userId, context.subject),
      canEditEvent: (hostingGroupIds: readonly GroupId[]) => canEditEvent(state, hostingGroupIds),
      canEditContest: (groupIds: readonly GroupId[]) => canEditContest(state, groupIds),
      canManageNotification: (actorGroupId: GroupId | null) => canManageNotification(state, actorGroupId),
      canEditOffline: () => canEditOffline(state),
      canEditFadderuke: () => canEditFadderuke(state),
      canCreateGroup: (groupType: GroupType) => canCreateGroup(state, groupType),
      canUpdateGroup: (groupId: GroupId, isInterestGroup: boolean) => canUpdateGroup(state, groupId, isInterestGroup),
      canDeleteGroup: (groupId: GroupId, isInterestGroup: boolean) => canDeleteGroup(state, groupId, isInterestGroup),
      canManageGroupMembership: (groupId: GroupId, isInterestGroup: boolean) =>
        canManageGroupMembership(state, groupId, isInterestGroup),
      canManageGroupRoles: (groupId: GroupId, isInterestGroup: boolean) =>
        canManageGroupRoles(state, groupId, isInterestGroup),
      canCreateEvents: () => canCreateEvents(state),
    }
  }, [context])
}
