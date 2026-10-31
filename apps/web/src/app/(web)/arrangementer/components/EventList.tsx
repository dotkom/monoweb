"use client"

import { EventCard, EventCardSkeleton } from "@/components/molecules/EventListItem/EventCard"
import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { LoadMoreSentinel } from "@/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import { useCurrentTime } from "@/utils/use-current-time"
import { getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceView, EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Text, cn } from "@dotkomonline/ui"
import { IconMoodConfuzed } from "@tabler/icons-react"
import { compareAsc, interval, isWithinInterval, subDays, subMilliseconds } from "date-fns"
import { memo, type FC } from "react"
import type { EventListViewMode } from "../utils/event-filters"

// Toolbar state changes should not rerender every event card and its attendance controls.
const MemoizedEventCard = memo(EventCard)
const MemoizedEventListItem = memo(EventListItem)

const OPENING_SOON_DAYS_THRESHOLD = 7 as const

export type EventListDisplayMode = "cards" | "list"

export type EventWithAttendanceDetails = EventWithAttendanceSummary | EventWithAttendanceView

export interface EventListLoadMoreProps {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

interface EventListProps {
  futureEventWithAttendances: EventWithAttendanceSummary[] | EventWithAttendanceView[]
  pastEventWithAttendances: EventWithAttendanceSummary[] | EventWithAttendanceView[]
  userId?: UserId
  futureLoadMore?: EventListLoadMoreProps
  pastLoadMore?: EventListLoadMoreProps
  alwaysShowChildEvents?: boolean
  viewMode?: EventListViewMode
  displayMode?: EventListDisplayMode
  registeredEventCount?: number
}

interface EventItemsProps {
  eventsWithAttendance: EventWithAttendanceDetails[]
  displayMode: EventListDisplayMode
  userId?: UserId
}

interface EventListSectionData {
  title?: string
  eventsWithAttendance: EventWithAttendanceDetails[]
}

export const EventItems: FC<EventItemsProps> = ({ eventsWithAttendance, displayMode, userId }) => {
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

export const EventList: FC<EventListProps> = ({
  futureEventWithAttendances,
  pastEventWithAttendances,
  futureLoadMore,
  pastLoadMore,
  alwaysShowChildEvents,
  viewMode = "ATTENDANCE",
  displayMode = "list",
  userId,
  registeredEventCount = 0,
}: EventListProps) => {
  const currentDate = useCurrentTime()
  const isCardView = displayMode === "cards"

  const filteredFutureEventWithAttendances = alwaysShowChildEvents
    ? futureEventWithAttendances
    : futureEventWithAttendances.filter((eventWithAttendance) => {
        if (!eventWithAttendance.event.parentId) {
          return true
        }

        const parentEventWithAttendance = futureEventWithAttendances.find(
          (candidateEventWithAttendance) => candidateEventWithAttendance.event.id === eventWithAttendance.event.parentId
        )

        // Keep the child visible if its parent event or attendance has been deleted.
        if (!parentEventWithAttendance?.attendance) {
          return true
        }

        return getAttendee(parentEventWithAttendance.attendance, userId ?? null)?.registeredAt != null
      })

  const groupedEvents = Object.groupBy(filteredFutureEventWithAttendances, (eventWithAttendance) => {
    if (!eventWithAttendance.attendance) {
      return "otherFutureEvents"
    }

    if (getAttendee(eventWithAttendance.attendance, userId ?? null)) {
      return "yourEvents"
    }

    if (eventWithAttendance.attendance.registerStart >= eventWithAttendance.attendance.registerEnd) {
      return "otherFutureEvents"
    }

    const eventOpenInterval = interval(
      eventWithAttendance.attendance.registerStart,
      eventWithAttendance.attendance.registerEnd
    )
    // Intervals are inclusive, so subtract one millisecond to keep this interval exclusive.
    const openingSoonInterval = interval(
      subDays(eventWithAttendance.attendance.registerStart, OPENING_SOON_DAYS_THRESHOLD),
      subMilliseconds(eventWithAttendance.attendance.registerStart, 1)
    )

    if (isWithinInterval(currentDate, eventOpenInterval)) {
      return "openEvents"
    }

    if (isWithinInterval(currentDate, openingSoonInterval)) {
      return "openingSoonEvents"
    }

    return "otherFutureEvents"
  })

  const { yourEvents = [], openEvents = [], openingSoonEvents = [], otherFutureEvents = [] } = groupedEvents

  openingSoonEvents.sort((firstEventWithAttendance, secondEventWithAttendance) => {
    if (!firstEventWithAttendance.attendance && !secondEventWithAttendance.attendance) {
      return 0
    }

    if (!firstEventWithAttendance.attendance?.registerStart) {
      return 1
    }

    if (!secondEventWithAttendance.attendance?.registerStart) {
      return -1
    }

    return compareAsc(
      firstEventWithAttendance.attendance.registerStart,
      secondEventWithAttendance.attendance.registerStart
    )
  })

  const eventSections =
    viewMode === "CHRONOLOGICAL"
      ? {
          futureEventSections: [
            {
              eventsWithAttendance: futureEventWithAttendances.slice(0, registeredEventCount),
            },
            {
              title: registeredEventCount > 0 ? "Kommende arrangementer" : undefined,
              eventsWithAttendance: futureEventWithAttendances.slice(registeredEventCount),
            },
          ],
          pastEventSections: [
            {
              title: "Tidligere arrangementer",
              eventsWithAttendance: pastEventWithAttendances,
            },
          ],
        }
      : {
          futureEventSections: [
            {
              title: "Dine arrangementer",
              eventsWithAttendance: yourEvents,
            },
            {
              title: "Åpne arrangementer",
              eventsWithAttendance: openEvents,
            },
            {
              title: "Åpner snart",
              eventsWithAttendance: openingSoonEvents,
            },
            {
              title: "Kommende arrangementer",
              eventsWithAttendance: otherFutureEvents,
            },
          ],
          pastEventSections: [
            {
              title: "Tidligere arrangementer",
              eventsWithAttendance: pastEventWithAttendances,
            },
          ],
        }

  if (futureEventWithAttendances.length === 0 && pastEventWithAttendances.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <IconMoodConfuzed className="h-10 w-10 text-gray-500 dark:text-stone-500" />
        <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise...</Text>
      </div>
    )
  }

  return (
    <section className={cn("flex w-full min-w-0 flex-col gap-2", isCardView && "gap-6")}>
      {eventSections.futureEventSections.map((eventSection, index) => (
        <EventListSection
          key={eventSection.title ?? index}
          eventSection={eventSection}
          displayMode={displayMode}
          userId={userId}
        />
      ))}

      {futureLoadMore !== undefined && (
        <LoadMoreSentinel
          fetchNextPage={futureLoadMore.fetchNextPage}
          hasNextPage={futureLoadMore.hasNextPage}
          isFetchingNextPage={futureLoadMore.isFetchingNextPage}
          isPlaceholderData={futureLoadMore.isPlaceholderData}
          isLoading={futureLoadMore.isLoading}
        />
      )}

      {eventSections.pastEventSections.map((eventSection, index) => (
        <EventListSection
          key={eventSection.title ?? index}
          eventSection={eventSection}
          displayMode={displayMode}
          userId={userId}
        />
      ))}

      {pastLoadMore !== undefined && (
        <LoadMoreSentinel
          fetchNextPage={pastLoadMore.fetchNextPage}
          hasNextPage={pastLoadMore.hasNextPage}
          isFetchingNextPage={pastLoadMore.isFetchingNextPage}
          isPlaceholderData={pastLoadMore.isPlaceholderData}
          isLoading={pastLoadMore.isLoading}
        />
      )}
    </section>
  )
}

interface EventListSectionProps {
  eventSection: EventListSectionData
  displayMode: EventListDisplayMode
  userId?: UserId
}

const EventListSection: FC<EventListSectionProps> = ({ eventSection, displayMode, userId }) => {
  if (eventSection.eventsWithAttendance.length === 0) {
    return null
  }

  return (
    <>
      {eventSection.title && <EventListDivider text={eventSection.title} />}
      <EventItems eventsWithAttendance={eventSection.eventsWithAttendance} displayMode={displayMode} userId={userId} />
    </>
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
