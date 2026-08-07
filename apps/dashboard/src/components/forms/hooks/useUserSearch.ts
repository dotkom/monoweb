import { useUserAllQuery } from "@/app/(internal)/brukere/queries"

/**
 * Hook for searching users by name or email.
 * Use with createSearchableSelectInput.
 */
export const useUserSearch = (searchQuery: string) => {
  const { users, isLoading } = useUserAllQuery(
    {
      filter: {
        byName: searchQuery,
        byEmail: searchQuery,
      },
    },
    {
      enabled: searchQuery.length > 0, // Only fetch when there is a search query
    }
  )

  return { data: users, isLoading }
}
