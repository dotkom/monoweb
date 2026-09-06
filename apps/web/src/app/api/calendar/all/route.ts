import { createCalendar, createCalendarEvent, createCalendarFeedResponse } from "@/app/api/calendar/ical"
import { server } from "@/utils/trpc/server"
import { getCurrentUTC } from "@dotkomonline/utils"
import { subMonths } from "date-fns"
import type { NextRequest, NextResponse } from "next/server"

const ALL_EVENTS_CALENDAR_LIMIT = 500

export async function GET(req: NextRequest): Promise<NextResponse> {
  void req

  const { items: events } = await server.event.all.query({
    take: ALL_EVENTS_CALENDAR_LIMIT,
    filter: {
      orderBy: "asc",
      byEndDate: {
        min: subMonths(getCurrentUTC(), 1),
        max: null,
      },
    },
  })

  const calendar = createCalendar("Linjeforeningen Onlines arrangementer")

  for (const { event } of events) {
    calendar.createEvent(createCalendarEvent(event))
  }

  return createCalendarFeedResponse(calendar.toString(), "public")
}
