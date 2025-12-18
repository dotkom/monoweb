import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/rpc"
import type { MarkFilterQuery } from "@dotkomonline/types"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const usePunishmentAllInfiniteQuery = (filter?: MarkFilterQuery, page?: Pageable) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.mark.findMany.infiniteQueryOptions({
      ...page,
      filter,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return { marks: useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]), ...query }
}
