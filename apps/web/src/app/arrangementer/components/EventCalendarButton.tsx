"use client"

import type { Event } from "@dotkomonline/rpc/event"
import { slugify } from "@dotkomonline/utils"
import { AddToCalendarButton } from "./AddToCalendarButton"
import { createCalendarEvent } from "./calendar-event"
import { createGoogleCalendarLink } from "./TimeLocationBox/utils"
import { createIcsBody } from "./ics"

interface EventCalendarButtonProps {
  event: Event
}

export function EventCalendarButton({ event }: EventCalendarButtonProps) {
  const calendarEvent = createCalendarEvent(event)

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
      googleCalendarAriaLabel="Legg arrangement i Google Kalender"
      icsBody={icsBody}
      icsFilename={icsFilename}
    />
  )
}
