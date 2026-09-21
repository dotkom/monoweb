import { auth0 } from "@/auth"
import { IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE } from "@/lib/link-identity-cookies"
import { getServerAccessToken } from "@/lib/server-access-token"
import { cookies } from "next/headers"
import { cache } from "react"
import { getAuthState, type AuthState } from "./authenticated-user-state"
import { server } from "./trpc/server"

export const getAuthenticatedUser = cache(async (): Promise<AuthState> => {
  const cookieStore = await cookies()
  const identityLinkStatus = cookieStore.get(IDENTITY_LINK_STATUS_COOKIE)?.value

  if (identityLinkStatus === IDENTITY_LINK_STATUS_VALUE) {
    return getAuthState({
      sessionUser: null,
      isSessionLoading: false,
      dbUserQuerySettled: false,
      dbUserQueryError: null,
      isDbUserQueryLoading: false,
      dbUser: null,
    })
  }

  const session = await auth0.getSession()
  const accessToken = await getServerAccessToken()
  const sessionUser = accessToken !== null && session?.user !== undefined ? session.user : null

  if (sessionUser === null) {
    return getAuthState({
      sessionUser: null,
      isSessionLoading: false,
      dbUserQuerySettled: false,
      dbUserQueryError: null,
      isDbUserQueryLoading: false,
      dbUser: null,
    })
  }

  try {
    const dbUser = await server.user.getMe.query()

    return getAuthState({
      sessionUser,
      isSessionLoading: false,
      dbUserQuerySettled: true,
      dbUserQueryError: null,
      isDbUserQueryLoading: false,
      dbUser,
    })
  } catch (error) {
    return getAuthState({
      sessionUser,
      isSessionLoading: false,
      dbUserQuerySettled: true,
      dbUserQueryError: error,
      isDbUserQueryLoading: false,
      dbUser: null,
    })
  }
})
