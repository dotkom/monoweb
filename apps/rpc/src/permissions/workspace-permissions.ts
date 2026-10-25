import type { GroupId } from "../modules/group/group"
import { GroupRoleTypeEnum } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasGroupRole,
  isAdministrator,
  isGroupMember,
  isSameSubject,
  type AffiliatedPrincipal,
  type AffiliatedPrincipalWithSubject,
} from "./principal"

export function canCreateWorkspaceUser(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canFindWorkspaceUser(
  principal: AffiliatedPrincipalWithSubject,
  userId: UserId,
  hasCustomKey: boolean
): boolean {
  if (hasCustomKey) {
    return isAdministrator(principal.affiliations)
  }

  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isSameSubject(principal, userId)) {
    return true
  }

  return false
}

export function canLinkWorkspaceUser(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canLinkWorkspaceGroup(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canResetWorkspaceUserPassword(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canCreateWorkspaceGroup(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canFindWorkspaceGroup(
  principal: AffiliatedPrincipal,
  groupSlug: GroupId,
  hasCustomKey: boolean
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (hasCustomKey) {
    return false
  }

  if (isGroupMember(principal.affiliations, groupSlug)) {
    return true
  }

  return false
}

export function canSynchronizeWorkspaceGroup(principal: AffiliatedPrincipal, groupSlug: GroupId): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, groupSlug, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, groupSlug, GroupRoleTypeEnum.DEPUTY_LEADER)) {
    return true
  }

  return false
}

export function canGetWorkspaceGroupMembers(principal: AffiliatedPrincipal, groupSlug: GroupId): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isGroupMember(principal.affiliations, groupSlug)) {
    return true
  }

  return false
}

export function canGetWorkspaceGroupsForUser(principal: AffiliatedPrincipalWithSubject, userId: UserId): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isSameSubject(principal, userId)) {
    return true
  }

  return false
}
