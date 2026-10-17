import type { EventVisibility } from "@dotkomonline/db"
import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasAnyGroupAffiliation,
  isAdministrator,
  isCommitteeMember,
  isGroupMember,
  type AffiliatedPrincipal,
} from "./principal"

export function canCreateEvents(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations) || principal.affiliations.size > 0
}

export function canCreateEvent(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return true
  }

  return hasAnyGroupAffiliation(principal.affiliations, groupIds)
}

export function canEditEvent(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return isAdministrator(principal.affiliations)
  }

  return hasAnyGroupAffiliation(principal.affiliations, groupIds)
}

export function canDeleteEvent(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (hostingGroupIds.length === 0) {
    return isAdministrator(principal.affiliations)
  }

  return hasAnyGroupAffiliation(principal.affiliations, hostingGroupIds)
}

export function canAddEventAttendance(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (hostingGroupIds.length === 0) {
    return isAdministrator(principal.affiliations)
  }

  return hasAnyGroupAffiliation(principal.affiliations, hostingGroupIds)
}

export function canListDeregisterReasons(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canViewDeregisterReason(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  return hasAnyGroupAffiliation(principal.affiliations, hostingGroupIds)
}

export function canListUnansweredFeedback(
  principal: AffiliatedPrincipal,
  requestedUserId: UserId,
  currentUserId: UserId
): boolean {
  return isCommitteeMember(principal.affiliations) || requestedUserId === currentUserId
}

export function canViewUnansweredFeedback(
  principal: AffiliatedPrincipal,
  requestedUserId: UserId,
  currentUserId: UserId,
  hostingGroupIds: readonly GroupId[]
): boolean {
  return hasAnyGroupAffiliation(principal.affiliations, hostingGroupIds) || requestedUserId === currentUserId
}

export function isEventOrganizer(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  return hostingGroupIds.some((groupId) => isGroupMember(principal.affiliations, groupId))
}

export function canViewEvent(principal: AffiliatedPrincipal | null, visibility: EventVisibility): boolean {
  switch (visibility) {
    case "PUBLIC":
      return true
    case "AUTHENTICATED":
      return principal !== null
    case "COMMITTEE_ONLY":
      return principal !== null && isCommitteeMember(principal.affiliations)
  }
}

function excludeVisibility(excludedVisibilities: EventVisibility[], visibility: EventVisibility): EventVisibility[] {
  if (excludedVisibilities.includes(visibility)) {
    return excludedVisibilities
  }

  return [...excludedVisibilities, visibility]
}

export function excludedVisibilitiesFor(
  principal: AffiliatedPrincipal | null,
  requestedExclusions: readonly EventVisibility[],
  options?: { canViewCommitteeOnly?: boolean }
): EventVisibility[] {
  let excludedVisibilities = [...requestedExclusions]
  const canViewAuthenticatedEvents = principal !== null
  const canViewCommitteeOnlyEvents =
    options?.canViewCommitteeOnly === true || (principal !== null && isCommitteeMember(principal.affiliations))

  if (!canViewAuthenticatedEvents) {
    excludedVisibilities = excludeVisibility(excludedVisibilities, "AUTHENTICATED")
  }

  if (!canViewCommitteeOnlyEvents) {
    excludedVisibilities = excludeVisibility(excludedVisibilities, "COMMITTEE_ONLY")
  }

  return excludedVisibilities
}
