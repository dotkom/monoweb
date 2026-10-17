import type { EventVisibility } from "../modules/event/event"
import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasAnyCommitteeAffiliation,
  hasEveryCommitteeAffiliation,
  isAdministrator,
  isCommitteeMember,
  isSameSubject,
  type AffiliatedPrincipal,
  type AffiliatedPrincipalWithSubject,
} from "./principal"

export function canCreateEvents(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canGetEventForAdmin(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canUploadEventFiles(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateEvent(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
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

export function canSetEventOrganizers(
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

export function canEditEvent(principal: AffiliatedPrincipal, groupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (groupIds.length === 0) {
    return false
  }

  return hasAnyCommitteeAffiliation(principal.affiliations, groupIds)
}

export function canDeleteEvent(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (hostingGroupIds.length === 0) {
    return false
  }

  return hasAnyCommitteeAffiliation(principal.affiliations, hostingGroupIds)
}

export function canAddEventAttendance(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  if (hostingGroupIds.length === 0) {
    return false
  }

  return hasAnyCommitteeAffiliation(principal.affiliations, hostingGroupIds)
}

export function canListDeregisterReasons(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canListUnansweredFeedback(principal: AffiliatedPrincipalWithSubject, requestedUserId: UserId): boolean {
  if (isSameSubject(principal, requestedUserId)) {
    return true
  }

  if (isCommitteeMember(principal.affiliations)) {
    return true
  }

  return false
}

export function canViewUnansweredFeedback(
  principal: AffiliatedPrincipalWithSubject,
  requestedUserId: UserId,
  hostingGroupIds: readonly GroupId[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (hasAnyCommitteeAffiliation(principal.affiliations, hostingGroupIds)) {
    return true
  }

  if (isSameSubject(principal, requestedUserId)) {
    return true
  }

  return false
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

export function isEventCommitteeOrganizer(
  principal: AffiliatedPrincipal,
  hostingGroupIds: readonly GroupId[]
): boolean {
  return hasAnyCommitteeAffiliation(principal.affiliations, hostingGroupIds)
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
