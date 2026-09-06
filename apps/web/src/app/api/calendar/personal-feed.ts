import { createSecretKey } from "node:crypto"
import {
  CALENDAR_ISSUER,
  createCalendar,
  createCalendarEvent,
  createCalendarFeedResponse,
} from "@/app/api/calendar/ical"
import { env } from "@/env"
import { getRpcServiceAccessToken } from "@/lib/rpc-service-access-token"
import { createServerClientWithAccessToken } from "@/utils/trpc/server"
import { getLogger } from "@dotkomonline/logger"
import type { EventWithAttendance } from "@dotkomonline/rpc/event"
import { errors, jwtVerify } from "jose"
import { NextResponse } from "next/server"

const logger = getLogger("web/calendar")
const CALENDAR_PAGE_SIZE = 100

export async function createPersonalCalendarFeedResponse(key: string): Promise<NextResponse> {
  const cryptoKey = createSecretKey(Buffer.from(env.SIGNING_KEY))

  try {
    const token = await jwtVerify(key, cryptoKey, {
      issuer: CALENDAR_ISSUER,
    })

    const subject = token.payload.sub

    if (subject === undefined) {
      throw new Error("subject was not present in signed token")
    }

    const serviceAccessToken = await getRpcServiceAccessToken()
    const serviceClient = createServerClientWithAccessToken(serviceAccessToken)
    const eventDetails = await loadAllAttendingEvents(serviceClient, subject)
    const calendar = createCalendar("Mine Online-arrangementer")

    for (const { event } of eventDetails) {
      calendar.createEvent(createCalendarEvent(event))
    }

    return createCalendarFeedResponse(calendar.toString(), "private")
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    logger.error(error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function loadAllAttendingEvents(
  serviceClient: ReturnType<typeof createServerClientWithAccessToken>,
  userId: string
): Promise<EventWithAttendance[]> {
  const items: EventWithAttendance[] = []
  let cursor: string | undefined

  do {
    const page = await serviceClient.event.allByAttendingUserIdForCalendar.query({
      id: userId,
      take: CALENDAR_PAGE_SIZE,
      cursor,
    })

    items.push(...page.items)
    cursor = page.nextCursor
  } while (cursor !== undefined)

  return items
}
