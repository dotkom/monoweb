import { GroupRoleTypeEnum } from "@dotkomonline/rpc/group"
import { CommitteeGroupSlug, hasGroupRole, isAdministrator, type AffiliatedPrincipal } from "./principal"

export function canManageOfflines(principal: AffiliatedPrincipal): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.LEADER)) {
    return true
  }

  if (hasGroupRole(principal.affiliations, CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.DEPUTY_LEADER)) {
    return true
  }

  return false
}
