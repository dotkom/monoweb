import { CommitteeGroupSlug, isAdministrator, isGroupMember, type AffiliatedPrincipal } from "./principal"

export function canManageCompanies(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isGroupMember(principal.affiliations, CommitteeGroupSlug.BEDKOM)) {
    return true
  }

  if (isGroupMember(principal.affiliations, CommitteeGroupSlug.FAGKOM)) {
    return true
  }

  return false
}
