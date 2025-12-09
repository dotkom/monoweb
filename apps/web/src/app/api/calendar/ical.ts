import type { Event } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { ICalEventData } from "ical-generator"
import { env } from "@/env"

/** Map a domain Event to an icalendar event */
export function createCalendarEvent(event: Event) {
  const url = new URL(`/arrangementer/${slugify(event.title)}/${event.id}`, env.NEXT_PUBLIC_ORIGIN)
  return {
    start: event.start,
    end: event.end,
    summary: event.title,
    description: event.description,
    location: event.locationAddress,
    url: url.toString(),
  } satisfies ICalEventData
}

export const CALENDAR_ISSUER = "https://online.ntnu.no"
