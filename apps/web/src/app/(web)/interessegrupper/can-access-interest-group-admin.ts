import type { GroupRoleType } from "@dotkomonline/rpc/group"

interface Authorization {
  isAdministrator: boolean
  affiliations: Record<string, GroupRoleType[]>
}

export function canAccessInterestGroupAdmin({
  isLeader,
  authorization,
}: {
  isLeader: boolean
  authorization: Authorization | undefined
}): boolean {
  if (isLeader) {
    return true
  }

  if (authorization === undefined) {
    return false
  }

  if (authorization.isAdministrator) {
    return true
  }

  // TODO: this needs to use the new principal permissions
  const backlogRoles = authorization.affiliations.backlog

  return backlogRoles !== undefined && backlogRoles.length > 0
}
