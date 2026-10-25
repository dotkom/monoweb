import { getServerAccessToken } from "@admin/lib/server-access-token"
import { server } from "@admin/lib/trpc-server"
import type { GroupId, GroupRoleType } from "@dotkomonline/rpc/group"
import type { AffiliatedPrincipal } from "@dotkomonline/rpc/permissions"
import { cache } from "react"

const EMPTY_AUTHORIZATION_VALUE = {
  isAdministrator: false,
  isCommitteeMember: false,
  affiliations: {},
} as const satisfies Awaited<ReturnType<typeof server.user.getAuthorization.query>>

function toAffiliationsMap(affiliations: Record<GroupId, GroupRoleType[]>): Map<GroupId, Set<GroupRoleType>> {
  const affiliationsMap = new Map<GroupId, Set<GroupRoleType>>()

  for (const [groupId, roles] of Object.entries(affiliations)) {
    affiliationsMap.set(groupId, new Set(roles))
  }

  return affiliationsMap
}

export const getServerAuthorization = cache(async () => {
  const accessToken = await getServerAccessToken()

  if (accessToken === null) {
    return EMPTY_AUTHORIZATION_VALUE
  }

  return server.user.getAuthorization.query()
})

export const getServerAuthorizationState = cache(async (): Promise<AffiliatedPrincipal> => {
  const authorization = await getServerAuthorization()

  return {
    affiliations: toAffiliationsMap(authorization.affiliations),
  }
})
