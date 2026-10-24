import type { GroupId } from "../modules/group/group"
import { hasAnyGroupAffiliation, isAdministrator, isCommitteeMember, type AffiliatedPrincipal } from "./principal"

export function canListNotifications(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateNotification(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canActAsNotificationGroup(principal: AffiliatedPrincipal, groupId: GroupId): boolean {
  return hasAnyGroupAffiliation(principal.affiliations, [groupId])
}

export function canManageNotification(principal: AffiliatedPrincipal, actorGroupId: GroupId | null): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (actorGroupId === null) {
    return false
  }

  return canActAsNotificationGroup(principal, actorGroupId)
}

export function canSendImportantNotification(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canTargetAllUsers(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canTargetSpecificUsers(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canTargetGroupMembers(principal: AffiliatedPrincipal, groupSlug: GroupId): boolean {
  return canActAsNotificationGroup(principal, groupSlug)
}

export function canTargetEventAttendees(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  return hasAnyGroupAffiliation(principal.affiliations, hostingGroupIds)
}
