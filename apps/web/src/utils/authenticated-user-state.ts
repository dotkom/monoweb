import type { User } from "@auth0/nextjs-auth0/types"
import type { UserRouter } from "@dotkomonline/rpc"
import { isTrpcErrorCode } from "@/utils/trpc-errors"

/**
 * Combines the Auth0 session with the database user from `user.getMe`.
 *
 * Error conditions:
 * - `isSessionInvalid`: Auth0 session exists but the access token is rejected (UNAUTHORIZED).
 * - `isMissingDbUser`: token is valid but no local user exists (NOT_FOUND).
 * - `isDbUserFetchError`: any other `getMe` failure (network, 5xx, etc.).
 */
export type AuthState = {
  sessionUser: User | null | undefined
  dbUser: UserRouter.GetMeOutput | null
  isLoading: boolean
  isSessionInvalid: boolean
  isMissingDbUser: boolean
  isDbUserFetchError: boolean
  isInvalid: boolean
}

export function getAuthState(
  sessionUser: User | null | undefined,
  isSessionLoading: boolean,
  dbUserQuerySettled: boolean,
  dbUserQueryError: unknown,
  isDbUserQueryLoading: boolean,
  dbUser: UserRouter.GetMeOutput | null
): AuthState {
  const isSessionInvalid = dbUserQuerySettled && isTrpcErrorCode(dbUserQueryError, "UNAUTHORIZED")

  const isMissingDbUser = dbUserQuerySettled && isTrpcErrorCode(dbUserQueryError, "NOT_FOUND")

  const isDbUserFetchError = Boolean(dbUserQuerySettled && dbUserQueryError && !isSessionInvalid && !isMissingDbUser)

  const isInvalid = isSessionInvalid || isMissingDbUser || isDbUserFetchError

  const isLoading = isSessionLoading || (Boolean(sessionUser) && isDbUserQueryLoading)

  return {
    sessionUser,
    dbUser,
    isLoading,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
    isInvalid,
  }
}
