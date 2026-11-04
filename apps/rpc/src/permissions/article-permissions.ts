import { isCommitteeMember, type AffiliatedPrincipal } from "./principal"

export function canManageArticles(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}
