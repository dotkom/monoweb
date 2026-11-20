import { GroupRoleTypeEnum, type GroupId, type GroupRoleType } from "@dotkomonline/rpc/group"
import type { Authorization } from "./authorization-context"

type AuthorizationState = Pick<Authorization, "isAdministrator" | "isCommitteeMember" | "affiliations">

/**
 * `opptak` read procedures
 */
export function canViewApplication(state: AuthorizationState): boolean {
  return state.isAdministrator || state.isCommitteeMember
}

function hasRoleTypeInAnyGroup(state: AuthorizationState, roleType: GroupRoleType): boolean {
  for (const roleTypes of state.affiliations.values()) {
    if (roleTypes.has(roleType)) {
      return true
    }
  }

  return false
}

/**
 * Row level access to a single committee in the `opptak` tables
 */
export function canViewApplicationGroup(state: AuthorizationState, groupId: GroupId): boolean {
  return state.isAdministrator || state.affiliations.has(groupId)
}

/**
 * `opptak` interview attendance, reserved for the committee itself
 */
export function isApplicationGroupMember(state: AuthorizationState, groupId: GroupId): boolean {
  return state.affiliations.has(groupId)
}

/**
 * `opptak` committee and applicant matching pages
 */
export function canViewApplicationMatching(state: AuthorizationState): boolean {
  return state.isAdministrator
}

/**
 * `opptak` committee availability pages
 */
export function canManageApplicationInterviews(state: AuthorizationState): boolean {
  return (
    state.isAdministrator ||
    hasRoleTypeInAnyGroup(state, GroupRoleTypeEnum.LEADER) ||
    hasRoleTypeInAnyGroup(state, GroupRoleTypeEnum.DEPUTY_LEADER)
  )
}

/**
 * `opptak` interview availability for a single committee
 */
export function canEditApplicationGroupAvailability(state: AuthorizationState, groupId: GroupId): boolean {
  return (
    state.isAdministrator ||
    (state.affiliations.get(groupId)?.has(GroupRoleTypeEnum.LEADER) ?? false) ||
    (state.affiliations.get(groupId)?.has(GroupRoleTypeEnum.DEPUTY_LEADER) ?? false)
  )
}

/**
 * `opptake` create/update/delete procedures
 */
export function canEditApplication(state: AuthorizationState): boolean {
  return state.isAdministrator
}
