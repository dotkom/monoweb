import { addSeconds, isBefore, subSeconds } from "date-fns"
import { decodeJwt } from "jose"

/**
 * Must match `tokenRefreshBuffer` on {@link https://github.com/auth0/nextjs-auth0 Auth0Client} in each app's `auth0.ts`
 * (currently one minute). Used when deciding if a cached access token is still usable server-side.
 */
export const AUTH0_TOKEN_REFRESH_BUFFER_SECONDS = 60

/** Allowed `?error=` query values */
export const AuthErrorCode = {
  LOGIN_FAILED: "login_failed",
  REGISTER_FAILED: "register_failed",
} as const

export type AuthErrorCodeValue = (typeof AuthErrorCode)[keyof typeof AuthErrorCode]

/**
 * Maps a safe auth error code from the query string to a user-facing message. If the code is unknown, a generic message
 * is returned.
 */
export function resolveAuthErrorMessage(code: string | null): string | null {
  if (code === null || code === "") {
    return null
  }

  if (code === AuthErrorCode.LOGIN_FAILED) {
    return "Innloggingen mislyktes. Prøv igjen."
  }

  if (code === AuthErrorCode.REGISTER_FAILED) {
    return "Vi kunne ikke opprette brukerprofilen din. Prøv å logge inn på nytt."
  }

  return "Noe gikk galt under innlogging. Prøv igjen."
}

/**
 * Returns true when the access token is still valid outside the refresh buffer. Matches `tokenRefreshBuffer` on
 * {@link https://github.com/auth0/nextjs-auth0 Auth0Client}.
 */
export function isAccessTokenUsable(accessToken: string): boolean {
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
 * `AccessTokenError.code` values from `@auth0/nextjs-auth0` (`AccessTokenErrorCode` in the SDK). Duplicated here to
 * keep `@dotkomonline/utils` independent from the Auth0 package.
 *
 * @see https://github.com/auth0/nextjs-auth0/blob/main/src/errors/oauth-errors.ts
 */
const Auth0AccessTokenErrorCode = {
  /** Session exists but the encrypted session has no refresh token when one is required. */
  MISSING_REFRESH_TOKEN: "missing_refresh_token",
  /**
   * Auth0 rejected a refresh-token grant. Tenant logs for the same failure often use types `ferrt` (rotating refresh
   * reuse) or `fertft` (revoked / missing in DB), with descriptions such as "reused refresh token detected" or "Token
   * could not be decoded or is missing in DB" — those strings appear in Auth0 logs, not in `error.message`.
   */
  FAILED_TO_REFRESH_TOKEN: "failed_to_refresh_token",
} as const

function readAuth0AccessTokenErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined
  }

  const code = error.code

  if (typeof code !== "string") {
    return undefined
  }

  return code
}

/**
 * Returns true when `getAccessToken()` reports a session that needs local clearing and a new login. This covers a
 * missing refresh token and a refresh rejected by Auth0.
 */
export function isAccessTokenFetchFailure(error: unknown): boolean {
  const code = readAuth0AccessTokenErrorCode(error)

  if (code === Auth0AccessTokenErrorCode.MISSING_REFRESH_TOKEN) {
    // SDK: the session is missing a refresh token after its access token expired.
    return true
  }

  if (code === Auth0AccessTokenErrorCode.FAILED_TO_REFRESH_TOKEN) {
    // SDK: refresh attempted; Auth0 OAuth error on `error.cause` (invalid_grant, etc.).
    return true
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Serialized errors can retain the SDK-facing message after losing the error code.
    if (message.includes("refresh token was not provided")) {
      return true
    }

    if (message.includes("error while trying to refresh")) {
      return true
    }
  }

  return false
}

// These names follow the session cookie formats used by the Auth0 SDK.
function isAuth0SdkSessionCookie(cookieName: string, sessionCookieName: string): boolean {
  // Large encrypted sessions are split into sessionName__0, sessionName__1 and so on.
  if (cookieName === sessionCookieName || cookieName.startsWith(`${sessionCookieName}__`)) {
    return true
  }

  // Connection-scoped access tokens stored separately by the SDK
  if (cookieName.startsWith("__FC")) {
    return true
  }

  // In-flight OAuth transaction cookies (PKCE verifier, state, returnTo) from the login redirect flow
  if (cookieName.startsWith("__txn_")) {
    return true
  }

  return false
}

/** Returns Auth0 SDK session, connection, and transaction cookie names present on the request. */
export function getAuthSessionCookieNamesToClear(cookieNames: string[], sessionCookieName: string): string[] {
  return cookieNames.filter((cookieName) => isAuth0SdkSessionCookie(cookieName, sessionCookieName))
}
