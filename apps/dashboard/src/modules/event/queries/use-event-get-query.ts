import type { EventId } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useEventDetailsGetQuery = (id: EventId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.event.getDashboardEventDetailData.queryOptions(id))
  return { data, ...query }
}
