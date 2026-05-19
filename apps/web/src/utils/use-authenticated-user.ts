"use client"

import { useTRPC } from "@/utils/trpc/client"
import { isTrpcErrorCode } from "@/utils/trpc-errors"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useQuery } from "@tanstack/react-query"

/**
 * Combines the Auth0 session with the database user from `user.getMe`.
 *
 * Error conditions:
 * - `isSessionInvalid`: Auth0 session exists but the access token is rejected (UNAUTHORIZED).
 * - `isMissingDbUser`: token is valid but no local user exists (NOT_FOUND).
 * - `isDbUserFetchError`: any other `getMe` failure (network, 5xx, etc.).
 */
export function useAuthenticatedUser() {
  const { user: sessionUser, isLoading: sessionLoading } = useUser()
  const trpc = useTRPC()

  const dbUserQuery = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: Boolean(sessionUser) && !sessionLoading,
    retry: false,
  })

  const dbUserQuerySettled = Boolean(sessionUser) && !sessionLoading && !dbUserQuery.isLoading

  const isSessionInvalid = dbUserQuerySettled && isTrpcErrorCode(dbUserQuery.error, "UNAUTHORIZED")

  const isMissingDbUser = dbUserQuerySettled && isTrpcErrorCode(dbUserQuery.error, "NOT_FOUND")

  const isDbUserFetchError = dbUserQuerySettled && dbUserQuery.isError && !isSessionInvalid && !isMissingDbUser

  const isInvalid = isSessionInvalid || isMissingDbUser || isDbUserFetchError

  const isLoading = sessionLoading || (Boolean(sessionUser) && dbUserQuery.isLoading)

  return {
    sessionUser,
    dbUser: dbUserQuery.data ?? null,
    dbUserQuery,
    isLoading,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
    isInvalid,
  }
}
