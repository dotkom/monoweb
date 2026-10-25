import type { GroupId, GroupRoleType } from "@dotkomonline/rpc/group"

/**
 * Mirrors {@link apps/rpc/src/modules/authorization-service.ts#ADMIN_AFFILIATIONS}
 */
const ADMIN_AFFILIATIONS = ["dotkom", "hs"] as const satisfies readonly GroupId[]

/**
 * Mirrors {@link apps/rpc/src/modules/authorization-service.ts#CommitteeGroupSlug}
 */
const CommitteeGroupSlug = {
  HOVEDSTYRET: "hs",
  DOTKOM: "dotkom",
  APPKOM: "appkom",
  ARRKOM: "arrkom",
  BACKLOG: "backlog",
  BANKOM: "bankom",
  BEDKOM: "bedkom",
  DEBUG: "debug",
  DOTDAGENE: "dotdagene",
  EKSKOM: "ekskom",
  FAGKOM: "fagkom",
  FEMINIT: "feminit",
  FONDET: "fondet",
  JUBKOM: "jubkom",
  ONLINE_IL: "online-il",
  PROKOM: "prokom",
  REDAKSJONEN: "redaksjonen",
  TRIKOM: "trikom",
  VELKOM: "velkom",
} as const satisfies Record<string, GroupId>

/**
 * Mirrors {@link apps/rpc/src/modules/authorization-service.ts#COMMITTEE_AFFILIATIONS}
 */
export const COMMITTEE_AFFILIATIONS: readonly GroupId[] = Object.values(CommitteeGroupSlug)

const COMMITTEE_AFFILIATION_SET = new Set<string>(COMMITTEE_AFFILIATIONS)

export function isCommitteeAffiliation(groupId: string): boolean {
  return COMMITTEE_AFFILIATION_SET.has(groupId)
}

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
 * `notification` edit/delete and recipient management procedures
 */
export function canManageNotification(state: AuthorizationState, actorGroupId: GroupId | null): boolean {
  if (actorGroupId === null) {
    return state.isAdministrator
  }

  return isGroupMember(state, actorGroupId)
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
