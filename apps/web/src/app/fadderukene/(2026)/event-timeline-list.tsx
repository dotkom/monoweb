"use client"

import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { AttendanceStatus } from "@/components/molecules/EventListItem/AttendanceStatus"
import { type Attendance, getAttendee } from "@dotkomonline/rpc/attendance"
import type { Event, EventWithAttendance } from "@dotkomonline/rpc/event"
import {
  Button,
  Label,
  Text,
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineGroupHeader,
  TimelineItem,
  TimelineSideLabel,
  Toggle,
  cn,
  groupTimelineEntries,
} from "@dotkomonline/ui"
import { capitalizeFirstLetter, createEventPageUrl } from "@dotkomonline/utils"
import { IconMapPin, IconMapPinShare } from "@tabler/icons-react"
import { format, isBefore, isPast, startOfToday } from "date-fns"
import { nb } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { Fragment, useState } from "react"

type EventTimelineListProps = {
  eventsWithAttendance: EventWithAttendance[]
  userId: string | null
}

const isPastEvent = (event: Event) => isBefore(event.end, startOfToday())

export function EventTimelineList({ eventsWithAttendance, userId }: EventTimelineListProps) {
  const [showPastEvents, setShowPastEvents] = useState(false)

  const hasPastEvents = eventsWithAttendance.some(({ event }) => isPastEvent(event))

  const visibleEventsWithAttendance = showPastEvents
    ? eventsWithAttendance
    : eventsWithAttendance.filter(({ event }) => !isPastEvent(event))

  const eventsWithAttendanceMap: Map<string, EventWithAttendance> = new Map(
    visibleEventsWithAttendance.map((value) => [value.event.id, value])
  )

  const eventsWithAttendanceGroups = groupTimelineEntries(
    visibleEventsWithAttendance.map(({ event }) => ({ id: event.id, date: event.start })),
    { groupBy: "day" }
  )

  return (
    <div className="flex flex-col gap-8">
      {hasPastEvents && (
        <div className="flex items-center gap-2">
          <Toggle
            aria-label="Vis tidligere arrangementer"
            checked={showPastEvents}
            onCheckedChange={setShowPastEvents}
            // I have noe clue why I need to manually assign the thumb color in dark mode
            className="data-unchecked:bg-[#bab2a6] dark:[&_[data-slot=switch-thumb][data-unchecked]]:bg-foreground"
          />
          <Label className="cursor-pointer" onClick={() => setShowPastEvents((previous) => !previous)}>
            Vis tidligere arrangementer
          </Label>
        </div>
      )}

      {visibleEventsWithAttendance.length === 0 ? (
        <Text className="text-muted-foreground">Ingen kommende arrangementer.</Text>
      ) : (
        <Timeline>
          {eventsWithAttendanceGroups.map((group) => {
            const startOfGroup = group.entries[0]?.date

            return (
              <Fragment key={group.key}>
                <TimelineGroupHeader position="side">
                  {capitalizeFirstLetter(format(startOfGroup, "EEEE", { locale: nb }))}
                  <br />
                  <Text element="span" className="text-muted-foreground font-medium text-xs">
                    {group.label.replace(/\.$/, "")}
                  </Text>
                </TimelineGroupHeader>

                {group.entries.map(({ id }) => {
                  const eventWithAttendance = eventsWithAttendanceMap.get(id)

                  if (eventWithAttendance === undefined) {
                    return null
                  }

                  const { event, attendance } = eventWithAttendance

                  return (
                    <TimelineItem key={event.id}>
                      <TimelineSideLabel className={cn(isPast(event.start) && "text-muted-foreground")}>
                        {format(event.start, "HH:mm", { locale: nb })}
                      </TimelineSideLabel>

                      <TimelineDot />
                      <TimelineContent>
                        <EventItem event={event} attendance={attendance} userId={userId} />
                      </TimelineContent>
                    </TimelineItem>
                  )
                })}
              </Fragment>
            )
          })}
        </Timeline>
      )}
    </div>
  )
}

interface EventItemProps {
  event: Event
  attendance: Attendance | null
  userId: string | null
}

const EventItem = ({ event, attendance, userId }: EventItemProps) => {
  const eventEndInPast = isPast(event.end)
  const attendee = getAttendee(attendance, userId)

  return (
    <div className="flex flex-col gap-1 xs:flex-row xs:gap-2 w-full -mt-4 mb-2">
      <Link
        href={createEventPageUrl(event.id, event.title)}
        className={cn(
          "group flex w-full justify-between gap-1 p-2 h-29 sm:h-28 md:h-32 transition-colors",
          eventEndInPast
            ? "bg-white/15 hover:bg-white/25 dark:bg-white/2 dark:hover:bg-white/6"
            : "bg-white/30 hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10",
          event.locationLink && !eventEndInPast ? "rounded-t-lg rounded-b-sm xs:rounded-lg" : "rounded-lg"
        )}
      >
        <div className="flex flex-col gap-2 p-2 w-full md:max-w-[467.67px]">
          <Text
            className={cn(
              "text-base lg:text-lg font-title font-medium line-clamp-2 md:truncate md:min-w-0",
              eventEndInPast && "text-muted-foreground"
            )}
          >
            {event.title}
          </Text>

          {event.locationTitle && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <IconMapPin
                aria-hidden
                className={cn(
                  "size-5 shrink-0",
                  eventEndInPast
                    ? "text-muted-foreground group-hover:text-gray-800 dark:group-hover:text-stone-400"
                    : "text-gray-800 dark:text-stone-400"
                )}
              />
              <Text className={cn(eventEndInPast && "text-muted-foreground")}>{event.locationTitle}</Text>
            </div>
          )}

          {attendance && (
            <AttendanceStatus attendance={attendance} attendee={attendee} eventEndInPast={eventEndInPast} size="lg" />
          )}
        </div>

        <div className="w-max max-sm:hidden">
          <div className="relative aspect-video h-24 md:h-28 bg-gray-100 dark:bg-stone-800 rounded-sm overflow-hidden">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                sizes="(min-width: 640px) 200px, 160px"
                className={cn(
                  "rounded-sm object-cover",
                  eventEndInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
                )}
              />
            ) : (
              <PlaceHolderImage
                variant={event.type}
                className={cn(
                  "rounded-sm object-cover",
                  eventEndInPast && "opacity-50 grayscale group-hover:grayscale-0 transition-all"
                )}
              />
            )}
          </div>
        </div>
      </Link>

      {event.locationLink && !eventEndInPast && (
        <Button
          element={Link}
          href={event.locationLink}
          className="grow h-8 rounded-b-lg rounded-t-sm xs:hidden w-auto p-0 bg-white/50 dark:bg-white/15"
          target="_blank"
          rel="noreferrer"
        >
          <IconMapPinShare className="size-4 xs:size-6 text-black/60 dark:text-muted-foreground" />
          <Text className="xs:hidden text-gray-700 dark:text-stone-300">Vis i kart</Text>
        </Button>
      )}
    </div>
  )
}
