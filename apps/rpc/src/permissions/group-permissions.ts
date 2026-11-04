import type { GroupId, GroupType } from "../modules/group/group"
import { GroupRoleTypeEnum, GroupTypeSchema } from "../modules/group/group"
import {
  CommitteeGroupSlug,
  hasGroupRole,
  isAdministrator,
  isCommitteeMember,
  isGroupMember,
  type AffiliatedPrincipal,
} from "./principal"

export function isInterestGroup(groupType: GroupType): boolean {
  return groupType === GroupTypeSchema.enum.INTEREST_GROUP
}

export function canCreateGroups(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)) {
    return true
  }

  return false
}

export function canCreateGroup(principal: AffiliatedPrincipal, groupType: GroupType): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isInterestGroup(groupType)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

export function canUpdateGroup(
  principal: AffiliatedPrincipal,
  groupId: GroupId,
  previousType: GroupType,
  nextType: GroupType = previousType
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  const canUpdatePrevious = isInterestGroup(previousType)
    ? isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
    : isCommitteeMember(principal.affiliations) && isGroupMember(principal.affiliations, groupId)

  if (!canUpdatePrevious) {
    return false
  }

  if (previousType === nextType) {
    return true
  }

  if (isInterestGroup(nextType)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

export function canDeleteGroup(principal: AffiliatedPrincipal, groupType: GroupType): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isInterestGroup(groupType)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  return false
}

export function canManageGroupMembership(
  principal: AffiliatedPrincipal,
  groupId: GroupId,
  groupType: GroupType
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isInterestGroup(groupType)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (hasGroupRole(principal.affiliations, groupId, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, groupId, GroupRoleTypeEnum.DEPUTY_LEADER)) {
    return true
  }

  return false
}

export function canManageGroupRoles(principal: AffiliatedPrincipal, groupId: GroupId, groupType: GroupType): boolean {
  return canManageGroupMembership(principal, groupId, groupType)
}

export function canUploadGroupFiles(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isCommitteeMember(principal.affiliations)) {
    return true
  }

  return false
}
