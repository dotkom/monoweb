import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasAnyCommitteeAffiliation,
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

  return hasAnyCommitteeAffiliation(principal.affiliations, groupIds)
}

export function canManageMark(
  principal: AffiliatedPrincipal,
  previousGroupIds: readonly GroupId[],
  nextGroupIds: readonly GroupId[] = previousGroupIds
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  return (
    hasAnyCommitteeAffiliation(principal.affiliations, previousGroupIds) &&
    hasAnyCommitteeAffiliation(principal.affiliations, nextGroupIds)
  )
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
