import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery, UserId } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseEventAllSummariesQueryProps {
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

export const useEventAllSummariesQuery = ({ filter, page, enabled }: UseEventAllSummariesQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.allSummaries.queryOptions({ filter, ...page }),
    enabled,
  })

  const eventDetails = useMemo(() => data?.items ?? [], [data])

  return { eventDetails, ...query }
}

export const useEventAllSummariesInfiniteQuery = ({ filter, page, enabled }: UseEventAllSummariesQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allSummaries.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })

  const eventDetails = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { eventDetails, ...query }
}

export const useEventAllSummariesByAttendingUserIdInfiniteQuery = ({
  id,
  filter,
  page,
  enabled,
}: UseEventAllByAttendingUserIdQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allSummariesByAttendingUserId.infiniteQueryOptions({
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
