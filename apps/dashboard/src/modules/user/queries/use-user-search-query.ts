import { trpc } from "../../../utils/trpc"

export const useUserSearchQuery = (searchString: string) => {
  const { data: users = [], ...query } = trpc.user.search.useQuery({ searchQuery: searchString, paginate: { take: 10 } })
  return { users, ...query }
}
