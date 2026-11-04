import { isAdministrator, type AffiliatedPrincipal } from "./principal"

export function canAccessAuditLog(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}
