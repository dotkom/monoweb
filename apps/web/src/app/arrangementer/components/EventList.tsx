"use client"

import { EventListItem, EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { useSession } from "@dotkomonline/oauth2/react"
import type { Event } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { isPast } from "date-fns"
import { type FC, useEffect, useRef } from "react"

const mapEventDetailToItem = (event: Event) => {
  // const attendeeStatus = attendanceStatuses?.get(event.attendanceId ?? "") ?? null
  //
  return <EventListItem event={event} attendeeStatus={null} key={event.id} />
}

interface EventListProps {
  events: Event[]
  fetchNextPage?(): void
}

export const EventList: FC<EventListProps> = (props: EventListProps) => {
  const lastFuture = props.events.findLastIndex((event) => !isPast(event.end))
  const futureEvents = props.events.slice(0, lastFuture + 1)
  const pastEvents = props.events.slice(lastFuture + 1)
  const session = useSession()

  const futureEventItems = futureEvents.map((eventDetail) => mapEventDetailToItem(eventDetail))
  const pastEventItems = pastEvents.map((eventDetail) => mapEventDetailToItem(eventDetail))

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        props.fetchNextPage?.()
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [props.fetchNextPage])

  if (props.events.length === 0) {
    return <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
  }

  return (
    <section className="w-full flex flex-col gap-2">
      {futureEventItems}

      {futureEventItems.length > 0 && pastEventItems.length > 0 && (
        <div className="w-full flex flex-row items-center gap-2 sm:-my-1">
          <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
          <Text className="text-gray-400 dark:text-stone-700 text-xs uppercase tracking-widest font-medium select-none">
            Tidligere arrangementer
          </Text>
          <span className="grow h-[2px] bg-gray-200 dark:bg-stone-800 rounded-full" />
        </div>
      )}

      {pastEventItems.length > 0 && pastEventItems}
      <div ref={loaderRef} />
    </section>
  )
}

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
