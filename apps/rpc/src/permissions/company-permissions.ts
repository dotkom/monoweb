import { isCommitteeMember, type AffiliatedPrincipal } from "./principal"

export function canManageCompanies(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}
