"use client"

import { EventCard, EventCardSkeleton } from "@/components/molecules/EventListItem/EventCard"
import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { LoadMoreSentinel } from "@/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import type { EventWithAttendanceView, EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Text, cn } from "@dotkomonline/ui"
import { IconMoodConfuzed } from "@tabler/icons-react"
import { memo } from "react"

// Toolbar state changes should not rerender every event card and its attendance controls.
const MemoizedEventCard = memo(EventCard)
const MemoizedEventListItem = memo(EventListItem)

export type EventListDisplayMode = "cards" | "list"

type EventWithAttendanceDetails = EventWithAttendanceSummary | EventWithAttendanceView

export interface EventListLoadMoreProps {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

interface EventListProps {
  futureEvents: EventWithAttendanceDetails[]
  pastEvents: EventWithAttendanceDetails[]
  userId?: UserId
  futureLoadMore?: EventListLoadMoreProps
  pastLoadMore?: EventListLoadMoreProps
  displayMode?: EventListDisplayMode
  registeredEventCount?: number
}

interface EventItemsProps {
  eventsWithAttendance: EventWithAttendanceDetails[]
  displayMode: EventListDisplayMode
  userId?: UserId
}

function EventItems({ eventsWithAttendance, displayMode, userId }: EventItemsProps) {
  if (displayMode === "cards") {
    return (
      <div className="grid -mx-3.25 w-[calc(100%+2*(--spacing(3.25)))] min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
        {eventsWithAttendance.map(({ event, attendance }) => (
          <MemoizedEventCard
            key={event.id}
            event={event}
            attendance={attendance}
            userId={userId}
            className="h-full min-w-0"
          />
        ))}
      </div>
    )
  }

  return eventsWithAttendance.map(({ event, attendance }) => (
    <MemoizedEventListItem key={event.id} event={event} attendance={attendance} userId={userId} />
  ))
}

const EventListDivider = ({ text }: { text: string }) => (
  <div className="flex w-full min-w-0 flex-row items-center gap-2 sm:-my-1">
    <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
    <Text className="shrink-0 select-none text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-stone-600">
      {text}
    </Text>
    <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
  </div>
)

export function EventList({
  futureEvents,
  pastEvents,
  futureLoadMore,
  pastLoadMore,
  displayMode = "list",
  userId,
  registeredEventCount = 0,
}: EventListProps) {
  if (futureEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <IconMoodConfuzed className="h-10 w-10 text-gray-500 dark:text-stone-500" />
        <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise...</Text>
      </div>
    )
  }

  const registeredEvents = futureEvents.slice(0, registeredEventCount)
  const upcomingEvents = futureEvents.slice(registeredEventCount)

  return (
    <section className={cn("flex w-full min-w-0 flex-col gap-2", displayMode === "cards" && "gap-6")}>
      {registeredEvents.length > 0 && (
        <EventItems eventsWithAttendance={registeredEvents} displayMode={displayMode} userId={userId} />
      )}

      {upcomingEvents.length > 0 && (
        <>
          {registeredEvents.length > 0 && <EventListDivider text="Kommende arrangementer" />}
          <EventItems eventsWithAttendance={upcomingEvents} displayMode={displayMode} userId={userId} />
        </>
      )}

      {futureLoadMore !== undefined && <LoadMoreSentinel {...futureLoadMore} />}

      {pastEvents.length > 0 && (
        <>
          <EventListDivider text="Tidligere arrangementer" />
          <EventItems eventsWithAttendance={pastEvents} displayMode={displayMode} userId={userId} />
        </>
      )}

      {pastLoadMore !== undefined && <LoadMoreSentinel {...pastLoadMore} />}
    </section>
  )
}

export const EventListSkeleton = ({ displayMode = "list" }: { displayMode?: EventListDisplayMode }) => {
  if (displayMode === "cards") {
    return (
      <div className="grid -mx-3.25 w-[calc(100%+2*(--spacing(3.25)))] min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
    </div>
  )
}
