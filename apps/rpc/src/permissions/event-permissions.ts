import type { EventVisibility } from "../modules/event/event"
import type { GroupId } from "../modules/group/group"
import type { UserId } from "../modules/user/user"
import {
  hasAnyCommitteeAffiliation,
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

  return hasAnyCommitteeAffiliation(principal.affiliations, groupIds)
}

export function canEditEvent(
  principal: AffiliatedPrincipal,
  previousGroupIds: readonly GroupId[],
  nextGroupIds: readonly GroupId[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  return (
    hasAnyCommitteeAffiliation(principal.affiliations, previousGroupIds) &&
    hasAnyCommitteeAffiliation(principal.affiliations, nextGroupIds)
  )
}

export function canDeleteEvent(principal: AffiliatedPrincipal, hostingGroupIds: readonly GroupId[]): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
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

  if (!canViewEvent(principal, "AUTHENTICATED")) {
    excludedVisibilities = excludeVisibility(excludedVisibilities, "AUTHENTICATED")
  }

  const canViewCommitteeOnlyEvents = options?.canViewCommitteeOnly === true || canViewEvent(principal, "COMMITTEE_ONLY")
  if (!canViewCommitteeOnlyEvents) {
    excludedVisibilities = excludeVisibility(excludedVisibilities, "COMMITTEE_ONLY")
  }

  return excludedVisibilities
}
