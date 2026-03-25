import { useUserAllQuery } from "@/app/(internal)/brukere/queries"

/**
 * Hook for searching users by name or email.
 * Use with createSearchableSelectInput.
 */
export const useUserSearch = (searchQuery: string) => {
  const { users, isLoading } = useUserAllQuery({
    filter: {
      byName: searchQuery,
      byEmail: searchQuery,
    },
  })

  return { data: users, isLoading }
}
