import ical, { type ICalEventData } from "ical-generator"

import { createAbsoluteEventPageUrl } from "./urls"
import { richTextToPlainText } from "./rich-text-to-plain-text"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  locationAddress: string | null
  locationTitle: string | null
  locationLink: string | null
  createdAt: Date
  updatedAt: Date
}

export function createIcsBody(event: ICalEventData, calendarName?: string) {
  const calendar = ical({
    name: calendarName,
    prodId: "online.ntnu.no",
  })

  calendar.createEvent(event)

  return calendar.toString()
}

export function createCalendarEvent(event: CalendarEvent, origin: string) {
  const eventUrl = createAbsoluteEventPageUrl(origin, event.id, event.title)
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

function createEventCalendarDescription(event: CalendarEvent, eventUrl: string) {
  const plainDescription = richTextToPlainText(event.description, null)
  const descriptionParts: string[] = []

  if (event.locationLink !== null && event.locationLink !== "") {
    descriptionParts.push(`Lokasjon: ${event.locationLink}`)
  }

  descriptionParts.push(`Arrangement: ${eventUrl}`)

  if (plainDescription.length > 0) {
    descriptionParts.push(plainDescription)
  }

  return descriptionParts.join("\n\n")
}
