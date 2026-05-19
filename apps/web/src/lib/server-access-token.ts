import { ACCESS_TOKEN_REQUEST_HEADER } from "@dotkomonline/utils"
import { decodeJwt } from "jose"
import { headers } from "next/headers"
import { auth0 } from "@/lib/auth0"
import { addSeconds, isBefore, subSeconds } from "date-fns"

/** Matches Auth0 client `tokenRefreshBuffer` (seconds). */
const TOKEN_REFRESH_BUFFER_SECONDS = 60

function isAccessTokenUsable(accessToken: string): boolean {
  try {
    const payload = decodeJwt(accessToken)

    if (payload.exp === undefined) {
      return true
    }

    const now = new Date()
    const expiresAt = addSeconds(new Date(0), payload.exp)
    const usableUntil = subSeconds(expiresAt, TOKEN_REFRESH_BUFFER_SECONDS)

    return isBefore(now, usableUntil)
  } catch {
    return false
  }
}

/**
 * Access token for server-side RPC calls.
 *
 * Middleware refreshes tokens on each navigation and forwards the fresh token via {@link ACCESS_TOKEN_REQUEST_HEADER}.
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
