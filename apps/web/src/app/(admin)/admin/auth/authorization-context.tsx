"use client"

import type { GroupId, GroupRoleType, GroupType } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { useSimulatedAuthorization } from "@admin/opptak/ForTestingRoleSimulation"
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
  canEditApplication,
  canViewApplication,
  canViewApplicationGroup,
  canViewApplicationMatching,
  canManageApplicationInterviews,
  isApplicationGroupMember,
  canEditApplicationGroupAvailability,
} from "./permissions"

export interface AuthorizationProviderProps {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Record<GroupId, GroupRoleType[]>
}

const AuthorizationContext = createContext<AuthorizationState | null>(null)

function toAffiliationsMap(affiliations: Record<GroupId, GroupRoleType[]>) {
  const affiliationsMap = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationsMap.set(groupId, new Set(roles))
  }

  return affiliationsMap
}

export function AuthorizationProvider({ children, ...props }: PropsWithChildren<AuthorizationProviderProps>) {
  const { isAdministrator, isCommitteeMember, affiliations } = useSimulatedAuthorization() ?? props
  const value = useMemo<AuthorizationState>(
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

  return useMemo(() => {
    const state: AuthorizationState = context

    return {
      isAdministrator: context.isAdministrator,
      isCommitteeMember: context.isCommitteeMember,
      affiliations: context.affiliations,
      isGroupMember: (groupId: GroupId) => isGroupMember(state, groupId),
      hasGroupRole: (groupId: GroupId, role: GroupRoleType) => hasGroupRole(state, groupId, role),
      hasAnyGroupAffiliation: (groupIds: readonly GroupId[]) => hasAnyGroupAffiliation(state, groupIds),
      canAccessAuditLog: () => canAccessAuditLog(state),
      canManageUserMemberships: () => canManageUserMemberships(state),
      canEditUserProfile: (userId: UserId, currentUserId: UserId | null) =>
        canEditUserProfile(state, userId, currentUserId),
      canEditEvent: (hostingGroupIds: readonly GroupId[]) => canEditEvent(state, hostingGroupIds),
      canEditContest: (groupIds: readonly GroupId[]) => canEditContest(state, groupIds),
      canManageNotification: (actorGroupId: GroupId | null) => canManageNotification(state, actorGroupId),
      canEditOffline: () => canEditOffline(state),
      canEditFadderuke: () => canEditFadderuke(state),
      canViewApplication: () => canViewApplication(state),
      canManageApplicationInterviews: () => canManageApplicationInterviews(state),
      canViewApplicationMatching: () => canViewApplicationMatching(state),
      canEditApplicationGroupAvailability: (groupId: GroupId) => canEditApplicationGroupAvailability(state, groupId),
      canViewApplicationGroup: (groupId: GroupId) => canViewApplicationGroup(state, groupId),
      isApplicationGroupMember: (groupId: GroupId) => isApplicationGroupMember(state, groupId),
      canEditApplication: () => canEditApplication(state),
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
