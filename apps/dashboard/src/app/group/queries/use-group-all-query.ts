import { useTRPC } from "@/trpc"

import { useQuery } from "@tanstack/react-query"

export const useGroupAllQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.group.all.queryOptions())
  if (data === undefined || query.isLoading) {
    return { groups: [], ...query }
  }
  return { groups: data, ...query }
}
