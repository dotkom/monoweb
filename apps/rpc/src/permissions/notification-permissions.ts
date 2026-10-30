import { GroupTypeSchema, type GroupId, type GroupType } from "../modules/group/group"
import { NotificationTypeSchema, type NotificationCreate } from "../modules/notification/notification"
import {
  CommitteeGroupSlug,
  hasAnyCommitteeAffiliation,
  isAdministrator,
  isCommitteeMember,
  isGroupMember,
  type AffiliatedPrincipal,
} from "./principal"

export type NotificationGroup = {
  slug: GroupId
  type: GroupType
}

export function canListNotifications(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateNotifications(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateNotification(
  principal: AffiliatedPrincipal,
  actorGroup: NotificationGroup,
  type: NotificationCreate["type"] = NotificationTypeSchema.enum.BROADCAST
): boolean {
  if (!canCreateNotifications(principal)) {
    return false
  }

  if (type === NotificationTypeSchema.enum.BROADCAST_IMPORTANT && !canSendImportantNotification(principal)) {
    return false
  }

  return canActAsNotificationGroup(principal, actorGroup)
}

export function canActAsNotificationGroup(principal: AffiliatedPrincipal, group: NotificationGroup): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  return hasNotificationGroupAffiliation(principal, [group])
}

export function canManageNotification(principal: AffiliatedPrincipal, actorGroup: NotificationGroup | null): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (actorGroup === null) {
    return false
  }

  return hasNotificationGroupAffiliation(principal, [actorGroup])
}

export function canSendImportantNotification(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canTargetAllUsers(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canTargetSpecificUsers(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canTargetGroupMembers(principal: AffiliatedPrincipal, group: NotificationGroup): boolean {
  return canActAsNotificationGroup(principal, group)
}

export function canTargetEventAttendees(
  principal: AffiliatedPrincipal,
  hostingGroups: readonly NotificationGroup[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  return hasNotificationGroupAffiliation(principal, hostingGroups)
}

function hasNotificationGroupAffiliation(
  principal: AffiliatedPrincipal,
  groups: readonly NotificationGroup[]
): boolean {
  if (groups.some((group) => group.type === GroupTypeSchema.enum.INTEREST_GROUP)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  return hasAnyCommitteeAffiliation(
    principal.affiliations,
    groups.map((group) => group.slug)
  )
}
