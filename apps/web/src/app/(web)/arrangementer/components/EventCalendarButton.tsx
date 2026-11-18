"use client"

import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { createCalendarEvent, createIcsBody, slugify } from "@dotkomonline/utils"
import { AddToCalendarButton } from "./AddToCalendarButton"
import { createGoogleCalendarLink } from "./TimeLocationBox/utils"

interface EventCalendarButtonProps {
  event: Event
}

export function EventCalendarButton({ event }: EventCalendarButtonProps) {
  const calendarEvent = createCalendarEvent(event, env.NEXT_PUBLIC_ORIGIN)

  const googleCalendarUrl = createGoogleCalendarLink({
    title: calendarEvent.summary,
    location: calendarEvent.location,
    description: calendarEvent.description,
    start: calendarEvent.start,
    end: calendarEvent.end,
  })

  const icsFilename = `${slugify(event.title)}.ics`
  const icsBody = createIcsBody(calendarEvent)

  return (
    <AddToCalendarButton
      googleCalendarUrl={googleCalendarUrl}
      ariaLabel="Legg arrangement i kalender"
      icsBody={icsBody}
      icsFilename={icsFilename}
      size="default"
      label="Kalender"
      variant="secondary"
      className="rounded-full bg-transparent text-base pl-2.5"
    />
  )
}
