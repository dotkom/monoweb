import { isCommitteeMember, type AffiliatedPrincipal } from "./principal"

export function canManageJobListings(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}
