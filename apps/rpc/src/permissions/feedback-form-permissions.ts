import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import { canEditEvent } from "./event-permissions"
import { isSameSubject, type AffiliatedPrincipal, type AffiliatedPrincipalWithSubject } from "./principal"

export function canManageFeedbackForm(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  return canEditEvent(principal, hostingGroupIds, hostingGroupIds)
}

export function canSubmitFeedbackAnswer(principal: AffiliatedPrincipalWithSubject, attendeeUserId: UserId): boolean {
  return isSameSubject(principal, attendeeUserId)
}

export function canViewOwnFeedbackAnswer(principal: AffiliatedPrincipalWithSubject, attendeeUserId: UserId): boolean {
  return isSameSubject(principal, attendeeUserId)
}
