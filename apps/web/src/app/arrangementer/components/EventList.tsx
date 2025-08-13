"use client"

import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { useSession } from "@dotkomonline/oauth2/react"
import type { EventDetail } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { differenceInDays, isFuture } from "date-fns"
import { type FC, useEffect, useRef } from "react"

const OPENING_SOON_DAYS_THRESHOLD = 3 as const

interface EventListProps {
  futureEventDetails: EventDetail[]
  pastEventDetails: EventDetail[]
  fetchNextPastEventsPage?(): void
}

export const EventList: FC<EventListProps> = ({
  futureEventDetails: futureEvents,
  pastEventDetails: pastEvents,
  fetchNextPastEventsPage,
}: EventListProps) => {
  const now = getCurrentUTC()
  const session = useSession()

  const groupedEvents = Object.groupBy(futureEvents, (event) => {
    if (event.attendance?.attendees.some((a) => a.user.id === session?.sub)) {
      return "yourEvents"
    }

    if (event.attendance && !isFuture(event.attendance.registerStart) && isFuture(event.attendance.registerEnd)) {
      return "openEvents"
    }

    if (
      event.attendance?.registerStart &&
      differenceInDays(event.attendance.registerStart, now) <= OPENING_SOON_DAYS_THRESHOLD
    ) {
      return "openingSoonEvents"
    }

    return "otherFutureEvents"
  })

  const { yourEvents = [], openEvents = [], openingSoonEvents = [], otherFutureEvents = [] } = groupedEvents

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPastEventsPage?.()
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchNextPastEventsPage])

  if (futureEvents.length === 0 && pastEvents.length === 0) {
    return <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
  }

  return (
    <section className="w-full flex flex-col gap-2">
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
      <div ref={loaderRef} />
    </section>
  )
}

const Divider = ({ text }: { text: string }) => (
  <div className="w-full flex flex-row items-center gap-2 sm:-my-1">
    <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
    <Text className="text-gray-400 dark:text-stone-700 text-xs uppercase tracking-widest font-medium select-none">
      {text}
    </Text>
    <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
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
