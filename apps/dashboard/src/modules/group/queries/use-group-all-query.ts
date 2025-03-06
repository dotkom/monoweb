import { trpc } from "../../../trpc"

export const useGroupAllQuery = () => {
  const { data, ...query } = trpc.group.all.useQuery()
  if (data === undefined || query.isLoading) {
    return { groups: [], ...query }
  }
  return { groups: data, ...query }
}
