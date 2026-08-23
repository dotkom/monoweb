"use client"

import { EventCard, EventCardSkeleton } from "@/components/molecules/EventListItem/EventCard"
import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { getAttendee } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendance, EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import type { UserId } from "@dotkomonline/rpc/user"
import { Text, cn } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconMoodConfuzed } from "@tabler/icons-react"
import { compareAsc, interval, isWithinInterval, subDays, subMilliseconds } from "date-fns"
import { Fragment, useEffect, useRef, type FC } from "react"
import z from "zod"

const OPENING_SOON_DAYS_THRESHOLD = 7 as const

export const EventListViewModeSchema = z.enum(["ATTENDANCE", "CHRONOLOGICAL"])
export type EventListViewMode = z.infer<typeof EventListViewModeSchema>
export type EventListDisplayMode = "cards" | "list"

export type EventWithAttendanceDetails = EventWithAttendanceSummary | EventWithAttendance

interface EventListProps {
  futureEventWithAttendances: EventWithAttendanceSummary[] | EventWithAttendance[]
  pastEventWithAttendances: EventWithAttendanceSummary[] | EventWithAttendance[]
  userId?: UserId
  onLoadMore?(): void
  alwaysShowChildEvents?: boolean
  viewMode?: EventListViewMode
  displayMode?: EventListDisplayMode
}

interface EventItemsProps {
  eventsWithAttendance: EventWithAttendanceDetails[]
  displayMode: EventListDisplayMode
  userId?: UserId
}

interface EventSection {
  key: string
  title?: string
  eventsWithAttendance: EventWithAttendanceDetails[]
}

export const EventItems: FC<EventItemsProps> = ({ eventsWithAttendance, displayMode, userId }) => {
  if (displayMode === "cards") {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
        {eventsWithAttendance.map(({ event, attendance }) => (
          <EventCard key={event.id} event={event} attendance={attendance} userId={userId} className="h-full min-w-0" />
        ))}
      </div>
    )
  }

  return eventsWithAttendance.map(({ event, attendance }) => (
    <EventListItem key={event.id} event={event} attendance={attendance} userId={userId} />
  ))
}

const Divider = ({ text }: { text: string }) => (
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
  onLoadMore,
  alwaysShowChildEvents,
  viewMode = "ATTENDANCE",
  displayMode = "list",
  userId,
}: EventListProps) => {
  const currentDate = getCurrentUTC()
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

        return getAttendee(parentEventWithAttendance.attendance, userId ?? null)?.reserved
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

  const eventSections: EventSection[] =
    viewMode === "CHRONOLOGICAL"
      ? [
          {
            key: "future-events",
            eventsWithAttendance: futureEventWithAttendances,
          },
          {
            key: "past-events",
            title: "Tidligere arrangementer",
            eventsWithAttendance: pastEventWithAttendances,
          },
        ]
      : [
          {
            key: "your-events",
            title: "Dine arrangementer",
            eventsWithAttendance: yourEvents,
          },
          {
            key: "open-events",
            title: "Åpne arrangementer",
            eventsWithAttendance: openEvents,
          },
          {
            key: "opening-soon-events",
            title: "Åpner snart",
            eventsWithAttendance: openingSoonEvents,
          },
          {
            key: "other-future-events",
            title: "Kommende arrangementer",
            eventsWithAttendance: otherFutureEvents,
          },
          {
            key: "past-events",
            title: "Tidligere arrangementer",
            eventsWithAttendance: pastEventWithAttendances,
          },
        ]

  const loaderElementReference = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoadMore?.()
      }
    })

    if (loaderElementReference.current) {
      intersectionObserver.observe(loaderElementReference.current)
    }

    return () => intersectionObserver.disconnect()
  }, [onLoadMore])

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
      {eventSections.map((eventSection) => {
        if (eventSection.eventsWithAttendance.length === 0) {
          return null
        }

        return (
          <Fragment key={eventSection.key}>
            {eventSection.title && <Divider text={eventSection.title} />}
            <EventItems
              eventsWithAttendance={eventSection.eventsWithAttendance}
              displayMode={displayMode}
              userId={userId}
            />
          </Fragment>
        )
      })}
      <div ref={loaderElementReference} />
    </section>
  )
}

export const EventListSkeleton = ({ displayMode = "list" }: { displayMode?: EventListDisplayMode }) => {
  if (displayMode === "cards") {
    return (
      <div className="grid w-full min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
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
