import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
}

export const useEventAllQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({ filter, ...page }),
  })

  return { events: useMemo(() => data?.items ?? [], [data]), ...query }
}

export const useEventAllInfiniteQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { events, ...query }
}
