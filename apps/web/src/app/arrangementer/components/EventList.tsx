"use client"

import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { useSession } from "@dotkomonline/oauth2/react"
import type { EventWithAttendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { interval, isWithinInterval, subDays, subMilliseconds } from "date-fns"
import { type FC, useEffect, useRef } from "react"
import z from "zod"

const OPENING_SOON_DAYS_THRESHOLD = 7 as const

export const EventListViewModeSchema = z.enum(["BY_CATEGORY", "BY_DATE"])
export type EventListViewMode = z.infer<typeof EventListViewModeSchema>

interface EventListProps {
  futureEventWithAttendances: EventWithAttendance[]
  pastEventWithAttendances: EventWithAttendance[]
  onLoadMore?(): void
  alwaysShowChildEvents?: boolean
  viewMode?: EventListViewMode
}

export const EventList: FC<EventListProps> = ({
  futureEventWithAttendances: futureEvents,
  pastEventWithAttendances: pastEvents,
  onLoadMore,
  alwaysShowChildEvents,
  viewMode = "BY_CATEGORY",
}: EventListProps) => {
  const now = getCurrentUTC()
  const session = useSession()

  const filteredFutureEvents = alwaysShowChildEvents
    ? futureEvents
    : futureEvents.filter((e) => {
        if (!e.event.parentId) {
          return true
        }

        const event = futureEvents.find((ev) => ev.event.id === e.event.parentId)

        // This is so the event doesn't disappear if the parent event or attendance was deleted
        if (!event?.attendance) {
          return true
        }

        return event.attendance.attendees.some((a) => a.user.id === session?.sub && a.reserved)
      })

  const groupedEvents = Object.groupBy(filteredFutureEvents, (event) => {
    if (!event.attendance) {
      return "otherFutureEvents"
    }

    if (event.attendance.attendees.some((a) => a.user.id === session?.sub)) {
      return "yourEvents"
    }

    if (event.attendance.registerStart >= event.attendance.registerEnd) {
      return "otherFutureEvents"
    }

    const eventOpenInterval = interval(event.attendance.registerStart, event.attendance.registerEnd)
    // Intervals are inclusive, so we subtract 1 millisecond to make it exclusive
    const openingSoonInterval = interval(
      subDays(event.attendance.registerStart, OPENING_SOON_DAYS_THRESHOLD),
      subMilliseconds(event.attendance.registerStart, 1)
    )

    if (isWithinInterval(now, eventOpenInterval)) {
      return "openEvents"
    }

    if (isWithinInterval(now, openingSoonInterval)) {
      return "openingSoonEvents"
    }

    return "otherFutureEvents"
  })

  const { yourEvents = [], openEvents = [], openingSoonEvents = [], otherFutureEvents = [] } = groupedEvents

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoadMore?.()
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [onLoadMore])

  if (futureEvents.length === 0 && pastEvents.length === 0) {
    return <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
  }

  return (
    <section className="w-full flex flex-col gap-2">
      {viewMode === "BY_DATE" ? (
        <>
          {futureEvents.length > 0 && (
            <>
              <Divider text="Kommende arrangementer" />
              {futureEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
          {pastEvents.length > 0 && (
            <>
              <Divider text="Tidligere arrangementer" />
              {pastEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {yourEvents.length > 0 && (
            <>
              <Divider text="Dine arrangementer" />
              {yourEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
          {openEvents.length > 0 && (
            <>
              <Divider text="Åpne arrangementer" />
              {openEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
          {openingSoonEvents.length > 0 && (
            <>
              <Divider text="Åpner snart" />
              {openingSoonEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
          {otherFutureEvents.length > 0 && (
            <>
              <Divider text="Kommende arrangementer" />
              {otherFutureEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
          {pastEvents.length > 0 && (
            <>
              <Divider text="Tidligere arrangementer" />
              {pastEvents.map(({ event, attendance }) => (
                <EventListItem event={event} attendance={attendance} userId={session?.sub ?? null} key={event.id} />
              ))}
            </>
          )}
        </>
      )}
      <div ref={loaderRef} />
    </section>
  )
}

const Divider = ({ text }: { text: string }) => (
  <div className="w-full flex flex-row items-center gap-2 sm:-my-1">
    <span className="grow h-[2px] bg-gray-200 dark:bg-stone-700 rounded-full" />
    <Text className="text-gray-400 dark:text-stone-600 text-xs uppercase tracking-widest font-medium select-none">
      {text}
    </Text>
    <span className="grow h-[2px] bg-gray-200 dark:bg-stone-700 rounded-full" />
  </div>
)

export const EventListSkeleton = () => {
  return (
    <div className="flex flex-col gap-1">
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
      <EventListItemSkeleton />
    </div>
  )
}
