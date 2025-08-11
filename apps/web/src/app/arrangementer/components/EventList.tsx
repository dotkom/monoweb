"use client"

import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { useSession } from "@dotkomonline/oauth2/react"
import type { AttendanceEvent } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { differenceInDays, isFuture, isPast } from "date-fns"
import { type FC, useEffect, useRef } from "react"

interface EventListProps {
  futureEvents: AttendanceEvent[]
  pastEvents: AttendanceEvent[]
  fetchNextPastEventsPage?(): void
}

export const EventList: FC<EventListProps> = ({
  futureEvents,
  pastEvents,
  fetchNextPastEventsPage,
}: EventListProps) => {
  const session = useSession()
  const now = getCurrentUTC()

  const [yourEvents, openEvents, openingSoonEvents, otherFutureEvents] = futureEvents.reduce<
    [AttendanceEvent[], AttendanceEvent[], AttendanceEvent[], AttendanceEvent[]]
  >(
    ([yourEvents, openEvents, openingSoonEvents, otherFutureEvents], event) => {
      if (event.attendance?.attendees.some((attendee) => attendee.user.id === session?.sub)) {
        yourEvents.push(event)
      } else if (
        event.attendance &&
        !isFuture(event.attendance.registerStart) &&
        isFuture(event.attendance.registerEnd)
      ) {
        openEvents.push(event)
      } else if (event.attendance?.registerStart && differenceInDays(event.attendance?.registerStart, now) <= 3) {
        openingSoonEvents.push(event)
      } else {
        otherFutureEvents.push(event)
      }
      return [yourEvents, openEvents, openingSoonEvents, otherFutureEvents]
    },
    [[], [], [], []]
  )

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
          {yourEvents.map((event) => (<EventListItem event={event} userId={session?.sub ?? null} key={event.id} />))}
        </>
      )}
      {openEvents.length > 0 && (
        <>
          <Divider text="Åpne arrangementer" />
          {openEvents.map((event) => (<EventListItem event={event} userId={session?.sub ?? null} key={event.id} />))}
        </>
      )}
      {openingSoonEvents.length > 0 && (
        <>
          <Divider text="Kommende arrangementer" />
          {openingSoonEvents.map((event) => (<EventListItem event={event} userId={session?.sub ?? null} key={event.id} />))}
        </>
      )}
      {otherFutureEvents.length > 0 && (
        <>
          <Divider text="Arrangementer" />
          {otherFutureEvents.map((event) => (<EventListItem event={event} userId={session?.sub ?? null} key={event.id} />))}
        </>
      )}
      {pastEvents.length > 0 && (
        <>
          <Divider text="Tidligere arrangementer" />
          {pastEvents.map((event) => (<EventListItem event={event} userId={session?.sub ?? null} key={event.id} />))}
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
