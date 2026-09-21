import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useDeregisterReasonWithEventAllInfiniteQuery = (page?: Pageable) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.findManyDeregisterReasonsWithEvent.infiniteQueryOptions({
      ...page,
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const deregisterReasons = useMemo(() => data ?? [], [data])

  return {
    deregisterReasons,
    ...query,
  }
}
