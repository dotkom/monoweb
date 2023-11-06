import { trpc } from "../../../utils/trpc"

export const useCommitteeAllQuery = () => {
  const { data, ...query } = trpc.committee.all.useQuery({ take: 999 })
  if (query.isLoading) {
    return { committees: [], ...query }
  }
  return { committees: data!.data, ...query }
}
