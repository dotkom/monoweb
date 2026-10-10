"use client"

import { useTRPC } from "@admin/lib/trpc-client"
import type { InterestGroupEventFilterQuery, InterestGroupEventId } from "@dotkomonline/rpc/interest-group-event"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useInterestGroupEventsWithRequestQuery = ({ filter }: { filter?: InterestGroupEventFilterQuery }) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.interestGroupEvent.findManyWithRequest.infiniteQueryOptions({
      filter,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { events, ...query }
}

export const useInterestGroupEventWithRequestQuery = (id: InterestGroupEventId) => {
  const trpc = useTRPC()

  return useQuery(trpc.interestGroupEvent.getByIdWithRequest.queryOptions(id))
}

export const useInterestGroupEventRegistrationsQuery = (id: InterestGroupEventId) => {
  const trpc = useTRPC()

  return useQuery(trpc.interestGroupEvent.findRegistrations.queryOptions(id))
}
