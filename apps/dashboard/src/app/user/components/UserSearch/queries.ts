import { useTRPC } from "@/trpc"
import type { AttendanceId } from "@dotkomonline/types"

import { useQuery } from "@tanstack/react-query"

export const useUserQuery = (id: AttendanceId) => {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.user.get.queryOptions(id))
  return { data, isLoading }
}

export const useUsersQuery = () => {
  const trpc = useTRPC()
  const { data = [], isLoading } = useQuery(trpc.user.all.queryOptions())
  return { data, isLoading }
}

export const useSearchUsersQuery = (fullName: string) => {
  const trpc = useTRPC()
  const { data = [], isLoading } = useQuery(
    trpc.user.searchByFullName.queryOptions({
      searchQuery: fullName,
    })
  )
  return { data, isLoading }
}
