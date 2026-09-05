"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useQuery } from "@tanstack/react-query"
import { getAuthState, type AuthState } from "./authenticated-user-state"

export function useAuthenticatedUser(initial?: AuthState) {
  const { user: sessionUser, isLoading: isSessionLoading } = useUser()
  const trpc = useTRPC()

  const dbUserQuery = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: Boolean(sessionUser) && !isSessionLoading,
    initialData: initial?.dbUser ?? undefined,
    retry: false,
  })

  const dbUserQuerySettled = Boolean(sessionUser) && !isSessionLoading && !dbUserQuery.isLoading

  const derivedAuthState = getAuthState({
    sessionUser,
    isSessionLoading,
    dbUserQuerySettled,
    dbUserQueryError: dbUserQuery.error,
    isDbUserQueryLoading: dbUserQuery.isLoading,
    dbUser: dbUserQuery.data ?? null,
  })

  if (initial !== undefined && derivedAuthState.isLoading) {
    return {
      ...initial,
      isLoading: false,
      dbUserQuery,
    }
  }

  return {
    ...derivedAuthState,
    dbUserQuery,
  }
}
