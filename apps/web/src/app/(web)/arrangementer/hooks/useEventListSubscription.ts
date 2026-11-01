"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { EventRouter } from "@dotkomonline/rpc"
import type { BulkRegisterChangeEvent } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { type InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useSubscription } from "@trpc/tanstack-react-query"
import { useMemo } from "react"
import { attendanceCardQueryOptions } from "../components/AttendanceCard/attendanceCardQueryOptions"
import { patchAttendanceFromRegisterChange } from "../components/AttendanceCard/patchAttendanceFromRegisterChange"
import { patchRegistrationAvailabilityFromPoolOccupancies } from "../components/AttendanceCard/patchRegistrationAvailabilityFromPoolOccupancies"
import { patchEventSummariesFromRegisterChange } from "../components/patchEventSummariesFromRegisterChange"

export interface EventListSubscription {
  attendanceIds: string[]
  isConnected: boolean
}

interface UseEventListSubscriptionOptions {
  events: EventWithAttendanceSummary[]
  enabled: boolean
}

export function useEventListSubscription({ events, enabled }: UseEventListSubscriptionOptions): EventListSubscription {
  const trpcClient = useTRPC()
  const queryClient = useQueryClient()

  const eventsWithAttendance = events.filter(({ attendance }) => attendance !== null)
  const eventsWithAttendanceIds = eventsWithAttendance.map(({ event }) => event.id)
  const eventIdsKey = JSON.stringify([...new Set(eventsWithAttendanceIds)].toSorted())

  const eventIds = useMemo<string[]>(() => JSON.parse(eventIdsKey), [eventIdsKey])

  const attendanceIds = enabled
    ? [...new Set(events.flatMap(({ attendance }) => (attendance === null ? [] : [attendance.id])))]
    : []

  const updateEventLists = (registerChangeEvent: BulkRegisterChangeEvent) => {
    const attendanceQuery = attendanceCardQueryOptions(trpcClient, registerChangeEvent.attendee.attendanceId)
    const availabilityQuery = trpcClient.event.attendance.getRegistrationAvailability.queryOptions({
      attendanceId: registerChangeEvent.attendee.attendanceId,
    })

    queryClient.setQueryData(attendanceQuery.queryKey, (previousData) =>
      patchAttendanceFromRegisterChange(previousData, registerChangeEvent)
    )

    if (registerChangeEvent.isCurrentUser) {
      void queryClient.invalidateQueries(availabilityQuery)
    } else {
      queryClient.setQueryData(availabilityQuery.queryKey, (previousData) =>
        patchRegistrationAvailabilityFromPoolOccupancies(previousData, registerChangeEvent.poolOccupancies)
      )
    }

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
  }

  const subscription = useSubscription(
    trpcClient.event.attendance.onBulkRegisterChange.subscriptionOptions(
      {
        eventIds,
      },
      {
        enabled: enabled && eventIds.length > 0,
        onData: updateEventLists,
      }
    )
  )

  return { attendanceIds, isConnected: subscription.status === "pending" }
}
