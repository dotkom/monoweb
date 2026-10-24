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
import { getEventDateRange } from "../utils/event-date"
import type { EventFilters } from "./useEventFilters"
import { useEventListOrder } from "./useEventListOrder"
import { useEventListSubscription } from "./useEventListSubscription"

const PAGE_SIZE = 20

export const toEventFilterQuery = (filters: EventFilters): EventFilterQuery => ({
  bySearchTerm: filters.search || undefined,
  byType: filters.types.length > 0 ? filters.types : undefined,
  byOrganizingGroup: filters.groups.length > 0 ? filters.groups : undefined,
  byStartDate: filters.date ? getEventDateRange(filters.date) : undefined,
})

interface UseEventListDataOptions {
  filters: EventFilters
  queryFilter: EventFilterQuery
  enabled: boolean
}

/** Events for the list views. Past events load once all upcoming events are loaded */
export const useEventListData = ({ filters, queryFilter, enabled }: UseEventListDataOptions) => {
  const { dbUser } = useAuthenticatedUser()
  const [now] = useState(() => roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" }))

  // Attendance sort doesn't apply when filtering by date
  const isAttendanceSort = filters.sort === "ATTENDANCE" && !filters.date
  const upcomingFilter = { ...queryFilter, byEndDate: { min: now, max: null } }

  const featured = useFeaturedEventsInfiniteQuery({
    filter: upcomingFilter,
    limit: PAGE_SIZE,
    enabled: enabled && isAttendanceSort,
  })

  const chronological = useEventAllSummariesInfiniteQuery({
    filter: { ...upcomingFilter, orderBy: "asc" },
    page: { take: PAGE_SIZE },
    enabled: enabled && !isAttendanceSort,
  })

  const future = isAttendanceSort ? featured : chronological

  const registered = useEventAllSummariesByAttendingUserIdInfiniteQuery({
    id: dbUser?.id ?? "",
    filter: { ...upcomingFilter, orderBy: "asc", excludingVisibility: [] },
    page: { take: PAGE_SIZE },
    enabled: enabled && Boolean(dbUser),
  })

  // The user's events go on top, so load all of them up front
  const { hasNextPage: hasNextRegisteredPage, isFetchingNextPage: isFetchingNextRegisteredPage } = registered
  const fetchNextRegisteredPage = registered.fetchNextPage

  useEffect(() => {
    if (enabled && dbUser && hasNextRegisteredPage && !isFetchingNextRegisteredPage) {
      void fetchNextRegisteredPage()
    }
  }, [enabled, dbUser, hasNextRegisteredPage, isFetchingNextRegisteredPage, fetchNextRegisteredPage])

  const isRegisteredLoading = Boolean(dbUser) && (registered.isLoading || hasNextRegisteredPage)

  const ordered = useEventListOrder({
    futureEvents: future.eventDetails,
    registeredEvents: registered.eventDetails,
    orderingKey: JSON.stringify({ filters, userId: dbUser?.id ?? null }),
    enabled,
    isInitialLoading: future.isLoading || isRegisteredLoading,
  })

  // `hasNextPage` is also false before the first page loads
  const hasLoadedAllFuture = !future.isLoading && future.hasNextPage === false

  const past = useEventAllSummariesInfiniteQuery({
    filter: { ...queryFilter, byEndDate: { min: null, max: now }, orderBy: "desc" },
    page: { take: PAGE_SIZE },
    enabled: enabled && hasLoadedAllFuture,
  })

  const futureFetchNextPage = future.fetchNextPage
  const pastFetchNextPage = past.fetchNextPage

  const futureLoadMore: EventListLoadMoreProps = useMemo(
    () => ({
      fetchNextPage: () => void futureFetchNextPage(),
      hasNextPage: future.hasNextPage,
      isFetchingNextPage: future.isFetchingNextPage,
      isPlaceholderData: future.isPlaceholderData,
      isLoading: ordered.isLoading,
    }),
    [futureFetchNextPage, future.hasNextPage, future.isFetchingNextPage, future.isPlaceholderData, ordered.isLoading]
  )

  const pastLoadMore: EventListLoadMoreProps = useMemo(
    () => ({
      fetchNextPage: () => void pastFetchNextPage(),
      hasNextPage: past.hasNextPage,
      isFetchingNextPage: past.isFetchingNextPage,
      isPlaceholderData: past.isPlaceholderData,
      isLoading: past.isLoading,
    }),
    [pastFetchNextPage, past.hasNextPage, past.isFetchingNextPage, past.isPlaceholderData, past.isLoading]
  )

  const subscriptionEvents = useMemo(
    () => [...future.eventDetails, ...past.eventDetails, ...registered.eventDetails],
    [future.eventDetails, past.eventDetails, registered.eventDetails]
  )

  const subscription = useEventListSubscription({ events: subscriptionEvents, enabled })

  return {
    futureEvents: ordered.eventDetails,
    pastEvents: past.eventDetails,
    // Own section only when sorting by date
    registeredEventCount: filters.sort === "CHRONOLOGICAL" ? ordered.registeredEventCount : 0,
    isLoading: ordered.isLoading || (ordered.eventDetails.length === 0 && past.isLoading),
    futureLoadMore,
    pastLoadMore: hasLoadedAllFuture ? pastLoadMore : undefined,
    subscription,
  }
}
