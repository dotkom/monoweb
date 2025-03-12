import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useEventAllQuery = () => {
  const trpc = useTRPC()
  const { data: events = [], ...query } = useQuery(trpc.event.all.queryOptions({ take: 50 }))
  return { events, ...query }
}
