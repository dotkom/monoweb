import type { AttendanceId } from "@dotkomonline/types"
import { trpc } from "../../utils/trpc"

export const useUserQuery = (id: AttendanceId) => {
  const { data, isLoading } = trpc.user.get.useQuery(id)
  return { data, isLoading }
}

export const useUsersQuery = () => {
  const { data = [], isLoading } = trpc.user.all.useQuery()
  return { data, isLoading }
}

export const useSearchUsersQuery = (fullName: string) => {
  const { data = [], isLoading } = trpc.user.searchByFullName.useQuery({
    searchQuery: fullName,
  })
  return { data, isLoading }
}
