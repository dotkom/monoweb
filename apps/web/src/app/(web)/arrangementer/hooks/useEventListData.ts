"use client"

import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import type { EventFilterQuery } from "@dotkomonline/rpc/event"
import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import {
  useEventAllSummariesByAttendingUserIdInfiniteQuery,
  useEventAllSummariesInfiniteQuery,
  useFeaturedEventsInfiniteQuery,
} from "../components/queries"
import type { EventListLoadMoreProps } from "../components/EventList"
import type { EventFilters } from "../utils/event-filters"
import { useEventListOrder } from "./useEventListOrder"
import { useEventListSubscription } from "./useEventListSubscription"

const PAGE_SIZE = 20

interface UseEventListDataOptions {
  filters: EventFilters
  queryFilter: EventFilterQuery
  enabled: boolean
}

export const useEventListData = ({ filters, queryFilter, enabled }: UseEventListDataOptions) => {
  const { dbUser } = useAuthenticatedUser()
  const [now] = useState(() => roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" }))

  // Attendance sort doesn't apply when filtering by date
  const isAttendanceSort = filters.sort === "ATTENDANCE" && !filters.date

  const upcomingFilter = {
    ...queryFilter,
    byEndDate: {
      min: now,
      max: null,
    },
  }

  const featuredEventsQuery = useFeaturedEventsInfiniteQuery({
    filter: upcomingFilter,
    limit: PAGE_SIZE,
    enabled: enabled && isAttendanceSort,
  })

  const chronologicalEventsQuery = useEventAllSummariesInfiniteQuery({
    filter: {
      ...upcomingFilter,
      orderBy: "asc",
    },
    page: {
      take: PAGE_SIZE,
    },
    enabled: enabled && !isAttendanceSort,
  })

  const futureEventsQuery = isAttendanceSort ? featuredEventsQuery : chronologicalEventsQuery

  const registeredEventsQuery = useEventAllSummariesByAttendingUserIdInfiniteQuery({
    id: dbUser?.id ?? "",
    filter: {
      ...upcomingFilter,
      orderBy: "asc",
      excludingVisibility: [],
    },
    page: {
      take: PAGE_SIZE,
    },
    enabled: enabled && Boolean(dbUser),
  })

  // The user's events go on top
  const {
    hasNextPage: hasNextRegisteredPage,
    isFetchingNextPage: isFetchingNextRegisteredPage,
    fetchNextPage: fetchNextRegisteredPage,
  } = registeredEventsQuery

  useEffect(() => {
    if (enabled && dbUser && hasNextRegisteredPage && !isFetchingNextRegisteredPage) {
      void fetchNextRegisteredPage()
    }
  }, [enabled, dbUser, hasNextRegisteredPage, isFetchingNextRegisteredPage, fetchNextRegisteredPage])

  const isRegisteredLoading = Boolean(dbUser) && (registeredEventsQuery.isLoading || hasNextRegisteredPage)

  const eventListOrder = useEventListOrder({
    futureEvents: futureEventsQuery.eventDetails,
    registeredEvents: registeredEventsQuery.eventDetails,
    orderingKey: JSON.stringify({ filters, userId: dbUser?.id ?? null }),
    enabled,
    isInitialLoading: futureEventsQuery.isLoading || isRegisteredLoading,
  })

  // `hasNextPage` is also false before the first page loads
  const hasLoadedAllFuture = !futureEventsQuery.isLoading && futureEventsQuery.hasNextPage === false

  const pastEventsQuery = useEventAllSummariesInfiniteQuery({
    filter: {
      ...queryFilter,
      byEndDate: {
        min: null,
        max: now,
      },
      orderBy: "desc",
    },
    page: {
      take: PAGE_SIZE,
    },
    enabled: enabled && hasLoadedAllFuture,
  })

  const futureFetchNextPage = futureEventsQuery.fetchNextPage
  const pastFetchNextPage = pastEventsQuery.fetchNextPage

  const futureLoadMore: EventListLoadMoreProps = useMemo(
    () => ({
      fetchNextPage: () => void futureFetchNextPage(),
      hasNextPage: futureEventsQuery.hasNextPage,
      isFetchingNextPage: futureEventsQuery.isFetchingNextPage,
      isPlaceholderData: futureEventsQuery.isPlaceholderData,
      isLoading: eventListOrder.isLoading,
    }),
    [
      futureFetchNextPage,
      futureEventsQuery.hasNextPage,
      futureEventsQuery.isFetchingNextPage,
      futureEventsQuery.isPlaceholderData,
      eventListOrder.isLoading,
    ]
  )

  const pastLoadMore: EventListLoadMoreProps = useMemo(
    () => ({
      fetchNextPage: () => void pastFetchNextPage(),
      hasNextPage: pastEventsQuery.hasNextPage,
      isFetchingNextPage: pastEventsQuery.isFetchingNextPage,
      isPlaceholderData: pastEventsQuery.isPlaceholderData,
      isLoading: pastEventsQuery.isLoading,
    }),
    [
      pastFetchNextPage,
      pastEventsQuery.hasNextPage,
      pastEventsQuery.isFetchingNextPage,
      pastEventsQuery.isPlaceholderData,
      pastEventsQuery.isLoading,
    ]
  )

  const subscriptionEvents = useMemo(
    () => [...futureEventsQuery.eventDetails, ...pastEventsQuery.eventDetails, ...registeredEventsQuery.eventDetails],
    [futureEventsQuery.eventDetails, pastEventsQuery.eventDetails, registeredEventsQuery.eventDetails]
  )

  const subscription = useEventListSubscription({
    events: subscriptionEvents,
    enabled,
  })

  return {
    futureEvents: eventListOrder.eventDetails,
    pastEvents: pastEventsQuery.eventDetails,
    // Your registered events are in its own separate section when sorting chronologically
    registeredEventCount: filters.sort === "CHRONOLOGICAL" ? eventListOrder.registeredEventCount : 0,
    isLoading: eventListOrder.isLoading || (eventListOrder.eventDetails.length === 0 && pastEventsQuery.isLoading),
    futureLoadMore,
    pastLoadMore: hasLoadedAllFuture ? pastLoadMore : undefined,
    subscription,
  }
}
