import { ACCESS_TOKEN_REQUEST_HEADER, isAccessTokenUsable } from "@dotkomonline/utils"
import { headers } from "next/headers"
import { auth0 } from "@/lib/auth0"

/**
 * Access token for server-side RPC calls.
 *
 * Middleware refreshes tokens on each navigation and forwards the fresh token via {@link ACCESS_TOKEN_REQUEST_HEADER}.
 * When that header is absent, this reads the session cookie directly but intentionally does not call
 * `auth0.getAccessToken()` since it throws in server components and middleware owns refresh.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  const headerStore = await headers()
  const tokenFromMiddleware = headerStore.get(ACCESS_TOKEN_REQUEST_HEADER)

  if (tokenFromMiddleware !== null && tokenFromMiddleware !== "" && isAccessTokenUsable(tokenFromMiddleware)) {
    return tokenFromMiddleware
  }

  const sessionToken = session.tokenSet?.accessToken

  if (sessionToken === undefined || sessionToken === "") {
    return null
  }

  if (!isAccessTokenUsable(sessionToken)) {
    return null
  }

  return sessionToken
}
