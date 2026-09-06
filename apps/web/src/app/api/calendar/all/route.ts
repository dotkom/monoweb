import { createCalendarEvent, createCalendarFeedResponse } from "@/app/api/calendar/ical"
import { server } from "@/utils/trpc/server"
import ical from "ical-generator"
import type { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest): Promise<NextResponse> {
  // TODO: Support paginating through the results
  void req
  const events = await server.event.all.query()
  const calendar = ical({ name: "Linjeforeningen Onlines arrangementer", prodId: "online.ntnu.no" })
  for (const { event } of events.items) {
    calendar.createEvent(createCalendarEvent(event))
  }
  return createCalendarFeedResponse(calendar.toString())
}
