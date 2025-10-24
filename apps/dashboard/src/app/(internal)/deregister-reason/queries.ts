import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/rpc"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useDeregisterReasonWithEventAllInfiniteQuery = (page?: Pageable) => {
  const trpc = useTRPC()

  const { data: deregisterReasons, ...query } = useInfiniteQuery({
    ...trpc.event.findManyDeregisterReasonsWithEvent.infiniteQueryOptions({
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return {
    deregisterReasons: useMemo(() => deregisterReasons?.pages.flatMap((page) => page.items) ?? [], [deregisterReasons]),
    ...query,
  }
}
