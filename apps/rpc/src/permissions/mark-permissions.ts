import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasAnyGroupAffiliation,
  hasEveryCommitteeAffiliation,
  isAdministrator,
  isCommitteeMember,
  isSameSubject,
  type AffiliatedPrincipal,
  type AffiliatedPrincipalWithSubject,
} from "./principal"

export function canCreateMarks(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateMark(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return false
  }

  return hasEveryCommitteeAffiliation(principal.affiliations, groupIds)
}

export function canSetMarkGroups(
  principal: AffiliatedPrincipal,
  groupIds: readonly GroupId[],
  previousGroupIds: readonly GroupId[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return false
  }

  const previousGroupIdSet = new Set(previousGroupIds)
  const addedGroupIds = groupIds.filter((groupId) => !previousGroupIdSet.has(groupId))

  return hasEveryCommitteeAffiliation(principal.affiliations, addedGroupIds)
}

export function canManageMark(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return false
  }

  return hasAnyGroupAffiliation(principal.affiliations, groupIds)
}

export function canListMarks(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canListAllMarks(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canViewUserPersonalMarks(principal: AffiliatedPrincipalWithSubject, userId: UserId): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isSameSubject(principal, userId)) {
    return true
  }

  return false
}
