import { createCalendarEvent } from "@/app/arrangementer/components/calendar-event"
import { hoursToSeconds } from "date-fns"
import ical, { ICalCalendarMethod } from "ical-generator"
import { NextResponse } from "next/server"

export { createCalendarEvent }

const CALENDAR_PRODUCT_ID = {
  company: "online.ntnu.no",
  product: "Events",
  language: "NO",
} as const

const CALENDAR_REFRESH_INTERVAL_SECONDS = hoursToSeconds(1)
const CALENDAR_FEED_CACHE_MAX_AGE_SECONDS = 300

export const CALENDAR_ISSUER = "https://online.ntnu.no"

export function createCalendar(name: string) {
  return ical({
    name,
    prodId: CALENDAR_PRODUCT_ID,
    method: ICalCalendarMethod.PUBLISH,
    ttl: CALENDAR_REFRESH_INTERVAL_SECONDS,
  })
}

export function createCalendarFeedResponse(calendarBody: string, cacheVisibility: "public" | "private"): NextResponse {
  return new NextResponse(calendarBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="online.ics"',
      "Cache-Control": `${cacheVisibility}, max-age=${CALENDAR_FEED_CACHE_MAX_AGE_SECONDS}`,
    },
  })
}
