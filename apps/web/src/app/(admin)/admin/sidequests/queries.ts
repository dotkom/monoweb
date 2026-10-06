"use client"

import { useTRPC } from "@admin/lib/trpc-client"
import type { SidequestFilterQuery, SidequestId } from "@dotkomonline/rpc/sidequest"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useSidequestsWithRequestQuery = ({ filter }: { filter?: SidequestFilterQuery }) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.sidequest.findManyWithRequest.infiniteQueryOptions({
      filter,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const events = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return { events, ...query }
}

export const useSidequestWithRequestQuery = (id: SidequestId) => {
  const trpc = useTRPC()

  return useQuery(trpc.sidequest.getByIdWithRequest.queryOptions(id))
}

export const useSidequestRegistrationsQuery = (id: SidequestId) => {
  const trpc = useTRPC()

  return useQuery(trpc.sidequest.findRegistrations.queryOptions(id))
}
