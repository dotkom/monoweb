import { GroupRoleTypeEnum } from "../modules/group/group"
import { SidequestStatusSchema, type SidequestStatus } from "../modules/sidequest/sidequest"
import { CommitteeGroupSlug, hasGroupRole, isAdministrator, isGroupMember, type AffiliatedPrincipal } from "./principal"

export function canAdminManageSidequests(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)) {
    return true
  }

  return false
}

export function canManageSidequestRequestsForGroup(principal: AffiliatedPrincipal, interestGroupId: string): boolean {
  if (canAdminManageSidequests(principal)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, interestGroupId, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  return false
}

export function canSeeUnpublishedSidequests(principal: AffiliatedPrincipal | null): boolean {
  if (principal === null) {
    return false
  }

  return canAdminManageSidequests(principal)
}

export function canViewSidequest(
  principal: AffiliatedPrincipal | null,
  sidequest: {
    status: SidequestStatus
    interestGroupId: string
  }
): boolean {
  if (sidequest.status === SidequestStatusSchema.enum.PUBLISHED) {
    return true
  }

  if (canSeeUnpublishedSidequests(principal)) {
    return true
  }

  if (sidequest.status === SidequestStatusSchema.enum.DELETED) {
    return false
  }

  if (principal === null) {
    return false
  }

  if (hasGroupRole(principal.affiliations, sidequest.interestGroupId, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  return false
}
