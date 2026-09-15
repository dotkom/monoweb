"use client"

import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { createAbsoluteEventPageUrl, richTextToPlainText, slugify } from "@dotkomonline/utils"
import { AddToCalendarButton } from "./AddToCalendarButton"
import { createGoogleCalendarLink } from "./TimeLocationBox/utils"
import { createIcsBody } from "./ics"

interface EventCalendarButtonProps {
  event: Event
}

export function EventCalendarButton({ event }: EventCalendarButtonProps) {
  const eventUrl = createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, event.id, event.title)
  const description = createEventCalendarDescription(event, eventUrl)
  const calendarLocation = event.locationAddress ?? event.locationTitle ?? undefined

  const googleCalendarUrl = createGoogleCalendarLink({
    title: event.title,
    location: calendarLocation,
    description,
    start: event.start,
    end: event.end,
  })

  const icsFilename = `${slugify(event.title)}.ics`
  const icsBody = createIcsBody({
    id: `${event.id}@online.ntnu.no`,
    summary: event.title,
    description,
    url: eventUrl,
    location: calendarLocation,
    start: event.start,
    end: event.end,
    created: event.createdAt,
    lastModified: event.updatedAt,
  })

  return (
    <AddToCalendarButton
      googleCalendarUrl={googleCalendarUrl}
      googleCalendarAriaLabel="Legg arrangement i Google Kalender"
      icsBody={icsBody}
      icsFilename={icsFilename}
    />
  )
}

function createEventCalendarDescription(event: Event, eventUrl: string) {
  const plainDescription = richTextToPlainText(event.description, null)
  const descriptionParts: string[] = []

  if (event.locationLink) {
    descriptionParts.push(event.locationLink)
  }

  descriptionParts.push(eventUrl)

  if (plainDescription.length > 0) {
    descriptionParts.push(plainDescription)
  }

  return descriptionParts.join("\n\n")
}
