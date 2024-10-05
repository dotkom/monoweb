import { trpc } from "../../../trpc"

export const useInterestGroupAllQuery = () => {
  const { data, ...query } = trpc.interestGroup.all.useQuery()
  if (data === undefined || query.isLoading) {
    return { interestGroups: [], ...query }
  }
  return { interestGroups: data.data, ...query }
}
