import { ACCESS_TOKEN_REQUEST_HEADER, AUTH0_TOKEN_REFRESH_BUFFER_SECONDS } from "@dotkomonline/utils"
import { decodeJwt } from "jose"
import { headers } from "next/headers"
import { auth0 } from "@/lib/auth0"
import { addSeconds, isBefore, subSeconds } from "date-fns"

function isAccessTokenUsable(accessToken: string): boolean {
  try {
    const payload = decodeJwt(accessToken)

    if (payload.exp === undefined) {
      return true
    }

    const now = new Date()
    const expiresAt = addSeconds(new Date(0), payload.exp)
    const usableUntil = subSeconds(expiresAt, AUTH0_TOKEN_REFRESH_BUFFER_SECONDS)

    return isBefore(now, usableUntil)
  } catch {
    return false
  }
}

/**
 * Access token for server-side RPC calls.
 *
 * Middleware refreshes tokens on each navigation and forwards the fresh token via {@link ACCESS_TOKEN_REQUEST_HEADER}.
 * When that header is absent, this reads the session cookie directly but intentionally does not call
 * `auth0.getAccessToken()` since it throws in server components and middleware owns refresh.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const headerStore = await headers()
  const tokenFromMiddleware = headerStore.get(ACCESS_TOKEN_REQUEST_HEADER)

  if (tokenFromMiddleware !== null && tokenFromMiddleware !== "" && isAccessTokenUsable(tokenFromMiddleware)) {
    return tokenFromMiddleware
  }

  const session = await auth0.getSession()
  const sessionToken = session?.tokenSet?.accessToken

  if (sessionToken === undefined || sessionToken === "") {
    return null
  }

  if (!isAccessTokenUsable(sessionToken)) {
    return null
  }

  return sessionToken
}
