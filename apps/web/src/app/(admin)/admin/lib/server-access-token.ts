import { isAccessTokenUsable } from "@dotkomonline/utils"
import { auth0 } from "@/lib/auth0"

/**
 * Access token for server-side RPC calls.
 *
 * Middleware refreshes expired tokens before rendering. The Auth0 SDK updates the request cookie as well as the
 * response cookie, which makes the refreshed session available here during the same request.
 */
export async function getServerAccessToken(): Promise<string | null> {
  // Middleware refreshes the session before rendering and saves it to both the request and response. This function
  // reads the resulting access token for server-side RPC calls.
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  const sessionToken = session.tokenSet?.accessToken

  // A session cookie can outlive its access token. Callers receive null while the session has no usable RPC token.
  if (sessionToken === undefined || sessionToken === "") {
    return null
  }

  if (!isAccessTokenUsable(sessionToken)) {
    return null
  }

  return sessionToken
}
