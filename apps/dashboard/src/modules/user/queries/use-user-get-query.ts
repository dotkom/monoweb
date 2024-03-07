import { trpc } from "../../../utils/trpc"

export const useUserGetQuery = (id: string) => {
  const { data: user, ...query } = trpc.user.get.useQuery(id)
  return { user, ...query }
}

export const useSearchUsersFromIDP = (searchQuery: string) => {
  const { data: usersFromIdp = [] } = trpc.user.searchByFullName.useQuery(
    { searchQuery },
    {
      enabled: searchQuery.length > 1,
    }
  )
  return { usersFromIdp }
}

export const useGetUserBySub = () => {
  return trpc.user.getBySubAsync.useMutation()
}
