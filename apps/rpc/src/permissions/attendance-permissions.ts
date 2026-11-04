import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import { canEditEvent } from "./event-permissions"
import { isSameSubject, type AffiliatedPrincipal, type AffiliatedPrincipalWithSubject } from "./principal"

export function canManageEventAttendance(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  return canEditEvent(principal, hostingGroupIds, hostingGroupIds)
}

export function canUpdateAttendeeSelections(
  principal: AffiliatedPrincipalWithSubject,
  hostingGroupIds: readonly GroupId[],
  attendeeUserId: UserId
): boolean {
  if (canManageEventAttendance(principal, hostingGroupIds)) {
    return true
  }

  if (isSameSubject(principal, attendeeUserId)) {
    return true
  }

  return false
}

export function canViewAttendeeChargeSchedule(
  principal: AffiliatedPrincipalWithSubject,
  hostingGroupIds: readonly GroupId[],
  attendeeUserId: UserId
): boolean {
  if (canManageEventAttendance(principal, hostingGroupIds)) {
    return true
  }

  if (isSameSubject(principal, attendeeUserId)) {
    return true
  }

  return false
}
