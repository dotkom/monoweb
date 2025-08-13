import { useTRPC } from "@/utils/trpc/client"
import type { EventFilterQuery, UserId } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import type { Pageable } from "node_modules/@dotkomonline/rpc/src/query"
import { useMemo } from "react"

interface UseEventAllQueryProps {
  filter: EventFilterQuery
  page?: Pageable
}

interface UseEventAllByAttendingUserIdQueryProps {
  id: UserId
  filter: EventFilterQuery
  page?: Pageable
}

export const useEventAllQuery = ({ filter, page }: UseEventAllQueryProps) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.event.all.queryOptions({ filter, ...page }),
  })

  const eventDetails = useMemo(() => data?.items ?? [], [data])

  return { eventDetails, ...query }
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

  const eventDetails = data?.pages.flatMap((page) => page.items) ?? []

  return { eventDetails, ...query }
}

export const useEventAllByAttendingUserIdInfiniteQuery = ({
  id,
  filter,
  page,
}: UseEventAllByAttendingUserIdQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.event.allByAttendingUserId.infiniteQueryOptions({
      id,
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const eventDetails = data?.pages.flatMap((page) => page.items) ?? []

  return { eventDetails, ...query }
}
