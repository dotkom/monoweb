import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { richTextToPlainText, slugify } from "@dotkomonline/utils"
import type { ICalEventData } from "ical-generator"
import { NextResponse } from "next/server"

/** Map a domain Event to an icalendar event */
export function createCalendarEvent(event: Event) {
  const url = new URL(`/arrangementer/${slugify(event.title)}/${event.id}`, env.NEXT_PUBLIC_ORIGIN)
  const plainDescription = richTextToPlainText(event.description, null)
  const description = event.locationLink ? `${event.locationLink}\n\n${plainDescription}` : plainDescription

  return {
    id: `${event.id}@online.ntnu.no`,
    start: event.start,
    end: event.end,
    summary: event.title,
    description,
    location: event.locationAddress,
    url: url.toString(),
    created: event.createdAt,
    lastModified: event.updatedAt,
  } satisfies ICalEventData
}

export const CALENDAR_ISSUER = "https://online.ntnu.no"

export function createCalendarFeedResponse(calendarBody: string): NextResponse {
  return new NextResponse(calendarBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
    },
  })
}
