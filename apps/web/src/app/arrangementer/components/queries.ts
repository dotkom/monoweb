import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery, UserId } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
  enabled?: boolean
}

interface UseEventAllByAttendingUserIdQueryProps {
  id: UserId
  filter: EventFilterQuery
  page?: Pageable
  enabled?: boolean
}

export const useEventAllQuery = ({ filter, page, enabled }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({ filter, ...page }),
    enabled,
  })

  const eventDetails = useMemo(() => data?.items ?? [], [data])

  return { eventDetails, ...query }
}

export const useEventAllInfiniteQuery = ({ filter, page, enabled }: UseEventAllQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.all.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })

  const eventDetails = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { eventDetails, ...query }
}

export const useEventAllByAttendingUserIdInfiniteQuery = ({
  id,
  filter,
  page,
  enabled,
}: UseEventAllByAttendingUserIdQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allByAttendingUserId.infiniteQueryOptions({
      id,
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })

  const eventDetails = data?.pages.flatMap((page) => page.items) ?? []

  return { eventDetails, ...query }
}
