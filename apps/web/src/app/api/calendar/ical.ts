import { env } from "@/env"
import type { Event } from "@dotkomonline/rpc/event"
import { richTextToPlainText, slugify } from "@dotkomonline/utils"
import { hoursToSeconds } from "date-fns"
import ical, { type ICalEventData } from "ical-generator"
import { NextResponse } from "next/server"

const CALENDAR_PRODUCT_ID = {
  company: "online.ntnu.no",
  product: "Events",
  language: "NO",
} as const

const CALENDAR_REFRESH_INTERVAL_SECONDS = hoursToSeconds(1)

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

export function createCalendar(name: string) {
  return ical({
    name,
    prodId: CALENDAR_PRODUCT_ID,
    ttl: CALENDAR_REFRESH_INTERVAL_SECONDS,
  })
}

export function createCalendarFeedResponse(calendarBody: string): NextResponse {
  return new NextResponse(calendarBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="online.ics"',
      "Cache-Control": "public, max-age=300",
    },
  })
}
