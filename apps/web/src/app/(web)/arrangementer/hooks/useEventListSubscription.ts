"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { EventRouter } from "@dotkomonline/rpc"
import type { BulkRegisterChangeEvent } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { type InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { useMemo } from "react"
import { patchEventSummariesFromRegisterChange } from "../components/patchEventSummariesFromRegisterChange"

interface UseEventListSubscriptionOptions {
  events: EventWithAttendanceSummary[]
  enabled: boolean
}

export function useEventListSubscription({ events, enabled }: UseEventListSubscriptionOptions) {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()

  const eventIdsKey = JSON.stringify(
    [...new Set(events.filter(({ attendance }) => attendance !== null).map(({ event }) => event.id))].sort()
  )

  const eventIds = useMemo<string[]>(() => JSON.parse(eventIdsKey), [eventIdsKey])

  const refreshEventLists = () => {
    void queryClient.invalidateQueries(trpcClient.event.allSummaries.infiniteQueryFilter())
    void queryClient.invalidateQueries(trpcClient.event.allSummariesByAttendingUserId.infiniteQueryFilter())
    void queryClient.invalidateQueries(trpcClient.event.findFeaturedEvents.infiniteQueryFilter())
  }

  const updateEventLists = (registerChangeEvent: BulkRegisterChangeEvent) => {
    queryClient.setQueriesData<InfiniteData<EventRouter.AllEventSummariesOutput>>(
      trpcClient.event.allSummaries.infiniteQueryFilter(),
      (previousData) => {
        if (previousData === undefined) {
          return previousData
        }

        return {
          ...previousData,
          pages: previousData.pages.map((page) => ({
            ...page,
            items: patchEventSummariesFromRegisterChange(page.items, registerChangeEvent),
          })),
        }
      }
    )
    queryClient.setQueriesData<InfiniteData<EventRouter.AllSummariesByAttendingUserIdOutput>>(
      trpcClient.event.allSummariesByAttendingUserId.infiniteQueryFilter(),
      (previousData) => {
        if (previousData === undefined) {
          return previousData
        }

        return {
          ...previousData,
          pages: previousData.pages.map((page) => ({
            ...page,
            items: patchEventSummariesFromRegisterChange(page.items, registerChangeEvent),
          })),
        }
      }
    )
    queryClient.setQueriesData<InfiniteData<EventRouter.FindFeaturedEventsOutput>>(
      trpcClient.event.findFeaturedEvents.infiniteQueryFilter(),
      (previousData) => {
        if (previousData === undefined) {
          return previousData
        }

        return {
          ...previousData,
          pages: previousData.pages.map((page) => patchEventSummariesFromRegisterChange(page, registerChangeEvent)),
        }
      }
    )

    if (registerChangeEvent.isCurrentUser && registerChangeEvent.status !== "reserved") {
      refreshEventLists()
    }
  }

  useSubscription(
    trpcClient.event.attendance.onBulkRegisterChange.subscriptionOptions(
      { eventIds },
      {
        enabled: enabled && eventIds.length > 0,
        onStarted: refreshEventLists,
        onData: updateEventLists,
      }
    )
  )
}
