import type { GroupId } from "../modules/group/group"
import { hasAnyGroupAffiliation, isAdministrator, isCommitteeMember, type AffiliatedPrincipal } from "./principal"

export function canCreateCommitteeApplicationPeriod(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canDeleteCommitteeApplicationPeriod(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canViewCommitteeApplicationPeriods(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canUpdateCommitteeApplicationPeriod(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canViewCommitteeApplications(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canInterviewCommitteeApplicationApplicants(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canViewCommitteeApplicationApplicantDetails(
  principal: AffiliatedPrincipal,
  selectedGroupIds: readonly GroupId[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  return (
    canInterviewCommitteeApplicationApplicants(principal) &&
    hasAnyGroupAffiliation(principal.affiliations, selectedGroupIds)
  )
}

export function canSetCommitteeApplicationInterviewAttendance(
  principal: AffiliatedPrincipal,
  groupId: GroupId
): boolean {
  return (
    canInterviewCommitteeApplicationApplicants(principal) && hasAnyGroupAffiliation(principal.affiliations, [groupId])
  )
}

export function canViewCommitteeApplicationInterviewBlocks(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canSetCommitteeApplicationInterviewBlocks(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canScheduleCommitteeApplicationInterview(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canCancelCommitteeApplicationInterview(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canViewCommitteeApplicationInterview(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canRescheduleCommitteeApplicationInterview(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canGenerateCommitteeApplicationInterviews(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canClearCommitteeApplicationInterviews(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canViewCommitteeApplicationInterviewSchedule(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canConfirmCommitteeApplicationInterviews(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canRevertCommitteeApplicationInterviewPublication(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}
