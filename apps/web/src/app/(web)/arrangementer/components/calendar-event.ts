import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { createAbsoluteEventPageUrl, richTextToPlainText } from "@dotkomonline/utils"
import type { ICalEventData } from "ical-generator"

export function createCalendarEvent(event: Event) {
  const eventUrl = createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, event.id, event.title)
  const description = createEventCalendarDescription(event, eventUrl)
  const location = event.locationAddress ?? event.locationTitle ?? undefined

  return {
    id: `${event.id}@online.ntnu.no`,
    start: event.start,
    end: event.end,
    summary: event.title,
    description,
    location,
    url: eventUrl,
    created: event.createdAt,
    lastModified: event.updatedAt,
  } satisfies ICalEventData
}

function createEventCalendarDescription(event: Event, eventUrl: string) {
  const plainDescription = richTextToPlainText(event.description, null)
  const descriptionParts: string[] = []

  if (event.locationLink) {
    descriptionParts.push(`Lokasjon: ${event.locationLink}`)
  }

  descriptionParts.push(`Arrangement: ${eventUrl}`)

  if (plainDescription.length > 0) {
    descriptionParts.push(plainDescription)
  }

  return descriptionParts.join("\n\n")
}
