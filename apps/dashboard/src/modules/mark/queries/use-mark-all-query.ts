import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useMarkAllQuery = () => {
  const trpc = useTRPC()
  const { data: marks, ...query } = useQuery({ ...trpc.mark.all.queryOptions({ take: 50 }), initialData: [] })
  return { marks, ...query }
}
