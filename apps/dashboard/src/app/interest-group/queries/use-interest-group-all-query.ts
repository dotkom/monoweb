import { useTRPC } from "@/lib/trpc"

import { useQuery } from "@tanstack/react-query"

export const useInterestGroupAllQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.interestGroup.all.queryOptions())
  if (data === undefined || query.isLoading) {
    return { interestGroups: [], ...query }
  }
  return { interestGroups: data, ...query }
}
