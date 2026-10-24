import type { GroupId } from "../modules/group/group"
import {
  hasAnyGroupAffiliation,
  hasEveryCommitteeAffiliation,
  isAdministrator,
  isCommitteeMember,
  type AffiliatedPrincipal,
} from "./principal"

export function canCreateContests(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateContest(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
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

export function canSetContestOrganizers(
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

export function canManageContest(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
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
