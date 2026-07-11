import type { GroupId, GroupRoleType, GroupType } from "@dotkomonline/rpc/group"
import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"

/**
 * Mirrors {@link apps/rpc/src/modules/authorization-service.ts#ADMIN_AFFILIATIONS}
 */
const ADMIN_AFFILIATIONS = ["dotkom", "hs"] as const satisfies readonly GroupId[]

/**
 * Mirrors {@link apps/rpc/src/modules/authorization-service.ts#CommitteeGroupSlug}
 */
const CommitteeGroupSlug = {
  BACKLOG: "backlog",
  PROKOM: "prokom",
  VELKOM: "velkom",
} as const satisfies Record<string, GroupId>

export interface AuthorizationState {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Map<GroupId, Set<GroupRoleType>>
}

function toAffiliationSet(
  affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | readonly GroupId[]
): Set<GroupId> {
  if (affiliations instanceof Map) {
    return new Set(affiliations.keys())
  }

  if (Array.isArray(affiliations)) {
    return new Set(affiliations)
  }

  return affiliations as Set<GroupId>
}

function isAdminAffiliated(affiliations: Map<GroupId, Set<GroupRoleType>>): boolean {
  return ADMIN_AFFILIATIONS.some((affiliation) => affiliations.has(affiliation))
}

/**
 * Mirrors {@link AuthorizationService#intersectGroupAffiliations}
 */
export function intersectGroupAffiliations(
  state: AuthorizationState,
  groupIds: Set<GroupId> | readonly GroupId[]
): Set<GroupId> {
  const userAffiliations = toAffiliationSet(state.affiliations)
  const desiredAffiliations = toAffiliationSet(groupIds)

  if (state.isAdministrator || isAdminAffiliated(state.affiliations)) {
    return desiredAffiliations
  }

  return userAffiliations.intersection(desiredAffiliations)
}

/**
 * Mirrors {@link AuthorizationService#hasAnyGroupAffiliation}
 */
export function hasAnyGroupAffiliation(state: AuthorizationState, groupIds: readonly GroupId[]): boolean {
  if (groupIds.length === 0) {
    return state.isAdministrator || isAdminAffiliated(state.affiliations)
  }

  return intersectGroupAffiliations(state, groupIds).size > 0
}

// In these UI helpers we treat admins as group members, which *may* not always be the case in RPC.
export function isGroupMember(state: AuthorizationState, groupId: GroupId): boolean {
  return state.isAdministrator || state.affiliations.has(groupId)
}

// In these UI helpers we treat admins as group members, which *may* not always be the case in RPC.
export function hasGroupRole(state: AuthorizationState, groupId: GroupId, role: GroupRoleType): boolean {
  return state.isAdministrator || (state.affiliations.get(groupId)?.has(role) ?? false)
}

/**
 * `auditLog` router procedures
 */
export function canAccessAuditLog(state: AuthorizationState): boolean {
  return state.isAdministrator
}

/**
 * `user.createMembership`, `user.updateMembership`, `user.deleteMembership`
 */
export function canManageUserMemberships(state: AuthorizationState): boolean {
  return state.isAdministrator
}

/**
 * `user.update` procedure
 */
export function canEditUserProfile(state: AuthorizationState, userId: UserId, currentUserId: UserId | null): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (currentUserId === null) {
    return false
  }

  return userId === currentUserId
}

/**
 * `event` create/edit/delete and related `attendance` admin procedures
 */
export function canEditEvent(state: AuthorizationState, hostingGroupIds: readonly GroupId[]): boolean {
  return hasAnyGroupAffiliation(state, hostingGroupIds)
}

/**
 * `contest` mutations
 */
export function canEditContest(state: AuthorizationState, groupIds: readonly GroupId[]): boolean {
  return hasAnyGroupAffiliation(state, groupIds)
}

/**
 * `offline` create/edit procedures
 */
export function canEditOffline(state: AuthorizationState): boolean {
  return (
    state.isAdministrator ||
    hasGroupRole(state, CommitteeGroupSlug.PROKOM, GroupRoleTypeEnum.LEADER) ||
    hasGroupRole(state, CommitteeGroupSlug.PROKOM, GroupRoleTypeEnum.DEPUTY_LEADER) ||
    hasGroupRole(state, CommitteeGroupSlug.PROKOM, GroupRoleTypeEnum.EDITOR_IN_CHIEF)
  )
}

/**
 * `fadderuke` create/update/delete procedures
 */
export function canEditFadderuke(state: AuthorizationState): boolean {
  return state.isAdministrator || isGroupMember(state, CommitteeGroupSlug.VELKOM)
}

/**
 * `group.create` procedure
 */
export function canCreateGroup(state: AuthorizationState, groupType: GroupType): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (groupType === "INTEREST_GROUP") {
    return isGroupMember(state, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

/**
 * `group.update` procedure
 */
export function canUpdateGroup(state: AuthorizationState, groupId: GroupId, isInterestGroup: boolean): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (isInterestGroup) {
    return isGroupMember(state, groupId) || isGroupMember(state, CommitteeGroupSlug.BACKLOG)
  }

  return isGroupMember(state, groupId)
}

/**
 * `group.delete` procedure
 */
export function canDeleteGroup(state: AuthorizationState, groupId: GroupId, isInterestGroup: boolean): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (hasGroupRole(state, groupId, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  if (isInterestGroup) {
    return isGroupMember(state, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

/**
 * `group.startMembership`, `group.endMembership`, `group.updateMembership` procedures
 */
export function canManageGroupMembership(
  state: AuthorizationState,
  groupId: GroupId,
  isInterestGroup: boolean
): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (
    hasGroupRole(state, groupId, GroupRoleTypeEnum.LEADER) ||
    hasGroupRole(state, groupId, GroupRoleTypeEnum.DEPUTY_LEADER)
  ) {
    return true
  }

  if (isInterestGroup) {
    return isGroupMember(state, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

/**
 * `group.createRole`, `group.updateRole` procedures
 */
export function canManageGroupRoles(state: AuthorizationState, groupId: GroupId, isInterestGroup: boolean): boolean {
  if (state.isAdministrator) {
    return true
  }

  if (
    hasGroupRole(state, groupId, GroupRoleTypeEnum.LEADER) ||
    hasGroupRole(state, groupId, GroupRoleTypeEnum.DEPUTY_LEADER)
  ) {
    return true
  }

  if (isInterestGroup) {
    return isGroupMember(state, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

export function canCreateEvents(state: AuthorizationState): boolean {
  return state.isAdministrator || state.affiliations.size > 0
}

/**
 * `notification` create/edit/delete and related procedures
 */
export function canManageNotifications(state: AuthorizationState): boolean {
  return state.isCommitteeMember
}

export function createAuthorizationState(
  authorization: Omit<AuthorizationState, "affiliations"> & {
    affiliations: Record<GroupId, GroupRoleType[]> | Map<GroupId, Set<GroupRoleType>>
  }
): AuthorizationState {
  if (authorization.affiliations instanceof Map) {
    return authorization as AuthorizationState
  }

  const affiliations = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(authorization.affiliations)) {
    affiliations.set(groupId, new Set(roles))
  }

  return {
    isAdministrator: authorization.isAdministrator,
    isCommitteeMember: authorization.isCommitteeMember,
    affiliations,
  }
}
