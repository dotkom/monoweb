"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useQuery } from "@tanstack/react-query"
import { getAuthState, type AuthState } from "./authenticated-user-state"

export function useAuthenticatedUser(initial?: AuthState) {
  const { user: sessionUser, isLoading: sessionLoading } = useUser()
  const trpc = useTRPC()

  const dbUserQuery = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: Boolean(sessionUser) && !sessionLoading,
    initialData: initial?.dbUser ?? undefined,
    retry: false,
  })

  const dbUserQuerySettled = Boolean(sessionUser) && !sessionLoading && !dbUserQuery.isLoading

  const derived = getAuthState(
    sessionUser,
    sessionLoading,
    dbUserQuerySettled,
    dbUserQuery.error,
    dbUserQuery.isLoading,
    dbUserQuery.data ?? null
  )

  if (initial !== undefined && derived.isLoading) {
    return {
      ...initial,
      isLoading: false,
      dbUserQuery,
    }
  }

  return {
    ...derived,
    dbUserQuery,
  }
}
