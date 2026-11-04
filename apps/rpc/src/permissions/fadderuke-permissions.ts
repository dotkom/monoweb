import { CommitteeGroupSlug, isAdministrator, isGroupMember, type AffiliatedPrincipal } from "./principal"

export function canManageFadderuker(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  return isGroupMember(principal.affiliations, CommitteeGroupSlug.VELKOM)
}
