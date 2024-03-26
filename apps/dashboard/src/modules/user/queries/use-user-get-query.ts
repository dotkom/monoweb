import { trpc } from "../../../utils/trpc"

export const useUserGetQuery = (id: string) => {
  const { data: user, ...query } = trpc.user.get.useQuery(id)
  return { user, ...query }
}

export const useSearchUsers = (searchQuery: string) => {
  const { data: users = [] } = trpc.user.searchByFullName.useQuery(
    { searchQuery },
    {
      enabled: searchQuery.length > 1,
    }
  )
  return { users }
}
