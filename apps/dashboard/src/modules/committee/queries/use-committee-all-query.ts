import { trpc } from "../../../trpc"

export const useCommitteeAllQuery = () => {
  const { data, ...query } = trpc.committee.all.useQuery()
  if (data === undefined || query.isLoading) {
    return { committees: [], ...query }
  }
  return { committees: data, ...query }
}
