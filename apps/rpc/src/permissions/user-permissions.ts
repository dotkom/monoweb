import type { UserId } from "../modules/user/user"
import {
  isAdministrator,
  isCommitteeMember,
  isSameSubject,
  type AffiliatedPrincipal,
  type AffiliatedPrincipalWithSubject,
} from "./principal"

export function canListUsers(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canManageUserMemberships(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canMergeUsers(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}

export function canEditUserProfile(principal: AffiliatedPrincipalWithSubject, userId: UserId): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (isSameSubject(principal, userId)) {
    return true
  }

  return false
}

export function canEditUserNameAndEmail(principal: AffiliatedPrincipal): boolean {
  return isAdministrator(principal.affiliations)
}
