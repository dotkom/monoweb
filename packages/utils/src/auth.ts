const AUTH_API_PREFIX = "/api/auth/"

/** Request header set in middleware after a successful token refresh. */
export const ACCESS_TOKEN_REQUEST_HEADER = "x-onlineweb-access-token"

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
 * Returns true when middleware should attempt a persisted token refresh for the request. Skips Auth0 route handlers to
 * avoid refresh/logout loops.
 */
export function shouldPersistSessionTokensInMiddleware(pathname: string): boolean {
  return !pathname.startsWith(AUTH_API_PREFIX)
}

export function isAccessTokenFetchFailure(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes("failed_to_refresh_token")) {
      return true
    }

    if (message.includes("access token has expired")) {
      return true
    }

    if (message.includes("refresh")) {
      return true
    }
  }

  return false
}
