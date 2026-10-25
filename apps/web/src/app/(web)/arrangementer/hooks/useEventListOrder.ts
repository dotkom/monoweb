"use client"

import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { useEffect, useRef } from "react"

interface UseEventListOrderOptions {
  futureEvents: EventWithAttendanceSummary[]
  registeredEvents: EventWithAttendanceSummary[]
  /**
   * A string that uniquely identifies the current order of the events.
   *
   * It is used to determine if the order has changed since the last render.
   * If the ordering key changes, the order is recalculated.
   */
  orderingKey: string
  isInitialLoading: boolean
  enabled: boolean
}

interface EventListOrder {
  orderingKey: string
  eventIds: string[]
  registeredEventIds: string[]
  initialized: boolean
}

export function useEventListOrder({
  futureEvents,
  registeredEvents,
  orderingKey,
  isInitialLoading,
  enabled,
}: UseEventListOrderOptions) {
  const previousOrder = useRef<EventListOrder>({
    orderingKey,
    eventIds: [],
    registeredEventIds: [],
    initialized: false,
  })

  const eventsById = new Map(
    [...registeredEvents, ...futureEvents].map((eventDetails) => [eventDetails.event.id, eventDetails])
  )

  const hasPreviousOrder = previousOrder.current.orderingKey === orderingKey && previousOrder.current.initialized
  const isLoading = !hasPreviousOrder && (isInitialLoading || !enabled)

  let orderedEventIds: string[] = []
  let initialRegisteredEventIds: string[] = []

  if (hasPreviousOrder) {
    // Keep existing positions during refetches, even if an event briefly disappears from both queries.
    initialRegisteredEventIds = previousOrder.current.registeredEventIds

    const previousEventIds = previousOrder.current.eventIds
    const previousEventIdSet = new Set(previousEventIds)
    const eventIdsNotInPreviousOrder = [...eventsById.keys()].filter((eventId) => !previousEventIdSet.has(eventId))

    orderedEventIds = [...previousEventIds, ...eventIdsNotInPreviousOrder]
  } else if (!isLoading) {
    // Put registered events first only when capturing the initial order for these filters and user.
    const events = [...eventsById.values()]

    initialRegisteredEventIds = events
      .filter(({ attendance }) => attendance?.currentUserAttendee)
      .map(({ event }) => event.id)

    const eventIdsNotInInitialRegisteredEventIds = events
      .filter(({ attendance }) => !attendance?.currentUserAttendee)
      .map(({ event }) => event.id)

    orderedEventIds = [...initialRegisteredEventIds, ...eventIdsNotInInitialRegisteredEventIds]
  }

  // These arrays are recreated on render. String keys make the effect depend on their contents.
  const orderedEventIdsKey = JSON.stringify(orderedEventIds)
  const initialRegisteredEventIdsKey = JSON.stringify(initialRegisteredEventIds)

  useEffect(() => {
    if (isLoading) {
      return
    }

    previousOrder.current = {
      orderingKey,
      eventIds: JSON.parse(orderedEventIdsKey),
      registeredEventIds: JSON.parse(initialRegisteredEventIdsKey),
      initialized: true,
    }
  }, [orderingKey, orderedEventIdsKey, initialRegisteredEventIdsKey, isLoading])

  const eventDetails = orderedEventIds.flatMap((eventId) => {
    const event = eventsById.get(eventId)

    if (event === undefined) {
      return []
    }

    return [event]
  })

  const initialRegisteredEventIdSet = new Set(initialRegisteredEventIds)
  const registeredEventCount = eventDetails.filter(({ event }) => initialRegisteredEventIdSet.has(event.id)).length

  return {
    eventDetails,
    registeredEventCount,
    isLoading,
  }
}
