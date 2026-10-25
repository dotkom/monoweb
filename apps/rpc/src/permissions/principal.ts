import type { UserId } from "../modules/user/user"
import type { GroupId, GroupRoleType } from "../modules/group/group"

export const CommitteeGroupSlug = {
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
  FOND: "fondet",
  JUBKOM: "jubkom",
  ONLINE_IL: "online-il",
  PROKOM: "prokom",
  REDAKSJONEN: "redaksjonen",
  TRIKOM: "trikom",
  VELKOM: "velkom",
} as const satisfies Record<string, GroupId>

export type CommitteeGroupSlug = (typeof CommitteeGroupSlug)[keyof typeof CommitteeGroupSlug]

export const COMMITTEE_AFFILIATIONS: CommitteeGroupSlug[] = Object.values(CommitteeGroupSlug)

export const ADMIN_AFFILIATIONS = [
  CommitteeGroupSlug.DOTKOM,
  CommitteeGroupSlug.HOVEDSTYRET,
] as const satisfies readonly GroupId[]

const COMMITTEE_AFFILIATION_SET = new Set<string>(COMMITTEE_AFFILIATIONS)

export type AffiliationMap = Map<GroupId, Set<GroupRoleType>>

export type AffiliationSetSource = AffiliationMap | Set<GroupId> | readonly GroupId[]

/**
 * A caller that carries group affiliations. Both the RPC principal and the admin authorization state satisfy this.
 */
export interface AffiliatedPrincipal {
  affiliations: AffiliationMap
}

export type AffiliatedPrincipalWithSubject = AffiliatedPrincipal & {
  subject: UserId
}

export function isCommitteeAffiliation(groupId: string): boolean {
  return COMMITTEE_AFFILIATION_SET.has(groupId)
}

export function toAffiliationSet(affiliations: AffiliationSetSource): Set<GroupId> {
  if (affiliations instanceof Map) {
    return new Set(affiliations.keys())
  }

  if (affiliations instanceof Set) {
    return affiliations
  }

  return new Set(affiliations)
}

/**
 * Find the intersection of the user's group affiliations and the given set of affiliations. Prefer to use this over
 * manually checking affiliations, since this will account for administrator permissions.
 */
export function intersectGroupAffiliations(
  userAffiliations: AffiliationSetSource,
  affiliationsToCompare: Set<GroupId> | readonly GroupId[]
): Set<GroupId> {
  const userAffiliationSet = toAffiliationSet(userAffiliations)
  const desiredAffiliations = toAffiliationSet(affiliationsToCompare)

  if (isAdministrator(userAffiliationSet)) {
    return desiredAffiliations
  }

  return userAffiliationSet.intersection(desiredAffiliations)
}

/**
 * Find if the user has AT LEAST one affiliation of the given set of affiliations. Prefer to use this over manually
 * checking affiliations, since this will account for administrator permissions.
 */
export function hasAnyGroupAffiliation(
  userAffiliations: AffiliationSetSource,
  affiliationsToCompare: Set<GroupId> | readonly GroupId[]
): boolean {
  return intersectGroupAffiliations(userAffiliations, affiliationsToCompare).size > 0
}

/**
 * Find if the user has EVERY affiliation of the given set of affiliations. Prefer to use this over manually checking
 * affiliations, since this will account for administrator permissions.
 */
export function hasEveryGroupAffiliation(
  userAffiliations: AffiliationSetSource,
  affiliationsToCompare: Set<GroupId> | readonly GroupId[]
): boolean {
  const intersection = intersectGroupAffiliations(userAffiliations, affiliationsToCompare)
  const desiredSize = toAffiliationSet(affiliationsToCompare).size

  return intersection.size === desiredSize
}

/**
 * Find if the user has AT LEAST one committee affiliation among the given set of affiliations. Interest groups and other
 * non-committee slugs are ignored. Prefer this over manually filtering, since this will account for administrator
 * permissions.
 */
export function hasAnyCommitteeAffiliation(
  userAffiliations: AffiliationSetSource,
  affiliationsToCompare: readonly GroupId[]
): boolean {
  const committeeAffiliationsToCompare = affiliationsToCompare.filter(isCommitteeAffiliation)

  return hasAnyGroupAffiliation(userAffiliations, committeeAffiliationsToCompare)
}

/**
 * Find if the user has EVERY committee affiliation of the given set of affiliations. Interest groups and other
 * non-committee slugs are ignored. Prefer this over manually filtering, since this will account for administrator
 * permissions.
 */
export function hasEveryCommitteeAffiliation(
  userAffiliations: AffiliationSetSource,
  affiliationsToCompare: readonly GroupId[]
): boolean {
  const committeeAffiliationsToCompare = affiliationsToCompare.filter(isCommitteeAffiliation)

  return hasEveryGroupAffiliation(userAffiliations, committeeAffiliationsToCompare)
}

/**
 * Helper for using intersectGroupAffiliations with all committee affiliations.
 */
export function isCommitteeMember(affiliations: AffiliationSetSource): boolean {
  return hasAnyGroupAffiliation(affiliations, COMMITTEE_AFFILIATIONS)
}

/**
 * Helper for using intersectGroupAffiliations with all administrator affiliations.
 */
export function isAdministrator(affiliations: AffiliationSetSource): boolean {
  const userAffiliationSet = toAffiliationSet(affiliations)

  return ADMIN_AFFILIATIONS.some((affiliation) => userAffiliationSet.has(affiliation))
}

/**
 * Helper for checking if the user has a specific group affiliation.
 */
export function isGroupMember(affiliations: AffiliationMap, groupId: GroupId): boolean {
  return affiliations.has(groupId)
}

/**
 * Helper for checking if the user has a specific group role.
 */
export function hasGroupRole(affiliations: AffiliationMap, groupId: GroupId, role: GroupRoleType): boolean {
  return affiliations.get(groupId)?.has(role) ?? false
}

/**
 * Helper for checking if the provided user ID is equal to the principal performing
 * the request.
 */
export function isSameSubject(principal: AffiliatedPrincipalWithSubject, userId: UserId | null): boolean {
  if (userId === null) {
    return false
  }

  return principal.subject === userId
}
