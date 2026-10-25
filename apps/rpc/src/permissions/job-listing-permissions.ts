import { CommitteeGroupSlug, isAdministrator, isGroupMember, type AffiliatedPrincipal } from "./principal"

export function canManageJobListings(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isGroupMember(principal.affiliations, CommitteeGroupSlug.BEDKOM)) {
    return true
  }

  return false
}
