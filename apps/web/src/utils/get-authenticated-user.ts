import { auth0 } from "@/auth"
import { getServerAccessToken } from "@/lib/server-access-token"
import { cache } from "react"
import { getAuthState, type AuthState } from "./authenticated-user-state"
import { server } from "./trpc/server"

export const getAuthenticatedUser = cache(async (): Promise<AuthState> => {
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
