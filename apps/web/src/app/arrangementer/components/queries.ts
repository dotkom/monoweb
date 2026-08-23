import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "@dotkomonline/utils"
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
  const take = page?.take ?? 20

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allSummaries.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => (lastPage.items.length < take ? undefined : lastPage.nextCursor),
    enabled,
  })

  const eventDetails = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { eventDetails, ...query }
}

interface UseFeaturedEventsInfiniteQueryProps {
  filter?: EventFilterQuery
  limit?: number
  enabled?: boolean
}

export const useFeaturedEventsInfiniteQuery = ({
  filter,
  limit = 20,
  enabled,
}: UseFeaturedEventsInfiniteQueryProps = {}) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.findFeaturedEvents.infiniteQueryOptions({
      filter,
      cursor: 0,
      offset: 0,
      limit,
    }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < limit ? undefined : pages.reduce((total, page) => total + page.length, 0),
    enabled,
  })

  const eventDetails = useMemo(() => data?.pages.flat() ?? [], [data])

  return { eventDetails, ...query }
}

export const useEventAllSummariesByAttendingUserIdInfiniteQuery = ({
  id,
  filter,
  page,
  enabled,
}: UseEventAllByAttendingUserIdQueryProps) => {
  const trpc = useTRPC()
  const take = page?.take ?? 20

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allSummariesByAttendingUserId.infiniteQueryOptions({
      id,
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => (lastPage.items.length < take ? undefined : lastPage.nextCursor),
    enabled,
  })

  const eventDetails = data?.pages.flatMap((page) => page.items) ?? []

  return { eventDetails, ...query }
}
