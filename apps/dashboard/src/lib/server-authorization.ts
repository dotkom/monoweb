import { getServerAccessToken } from "@/lib/server-access-token"
import { server } from "@/lib/trpc-server"
import { cache } from "react"
import { createAuthorizationState } from "@/auth/permissions"

const EMPTY_AUTHORIZATION_VALUE = {
  isAdministrator: false,
  isCommitteeMember: false,
  affiliations: {},
} as const satisfies Awaited<ReturnType<typeof server.user.getAuthorization.query>>

export const getServerAuthorization = cache(async () => {
  const accessToken = await getServerAccessToken()

  if (accessToken === null) {
    return EMPTY_AUTHORIZATION_VALUE
  }

  return server.user.getAuthorization.query()
})

export const getServerAuthorizationState = cache(async () => {
  const authorization = await getServerAuthorization()

  return createAuthorizationState(authorization)
})
