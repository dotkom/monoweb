"use client"

import { useTRPC } from "@/utils/trpc/client"
import { isTrpcErrorCode } from "@/utils/trpc-errors"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useQuery } from "@tanstack/react-query"

export function useAuthenticatedUser() {
  const { user: sessionUser, isLoading: sessionLoading } = useUser()
  const trpc = useTRPC()

  const dbUserQuery = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: Boolean(sessionUser) && !sessionLoading,
    retry: false,
  })

  const isSessionInvalid =
    Boolean(sessionUser) && !dbUserQuery.isLoading && isTrpcErrorCode(dbUserQuery.error, "UNAUTHORIZED")

  const isMissingDbUser =
    Boolean(sessionUser) && !dbUserQuery.isLoading && isTrpcErrorCode(dbUserQuery.error, "NOT_FOUND")

  const isInvalid = isSessionInvalid || isMissingDbUser

  const isLoading = sessionLoading || (Boolean(sessionUser) && (dbUserQuery.isLoading || dbUserQuery.isFetching))

  const isAuthenticated = Boolean(sessionUser) && !isInvalid && dbUserQuery.data !== undefined

  return {
    sessionUser,
    dbUser: dbUserQuery.data ?? null,
    dbUserQuery,
    isLoading,
    isAuthenticated,
    isSessionInvalid,
    isMissingDbUser,
    isInvalid,
  }
}
