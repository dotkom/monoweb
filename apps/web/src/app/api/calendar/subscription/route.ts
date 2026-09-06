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
import { jwtVerify } from "jose"
import { JWTClaimValidationFailed, JWTInvalid } from "jose/errors"
import { type NextRequest, NextResponse } from "next/server"

const logger = getLogger("web/calendar")

export async function GET(req: NextRequest): Promise<NextResponse> {
  const key = req.nextUrl.searchParams.get("key")

  if (key === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  const cryptoKey = createSecretKey(Buffer.from(env.SIGNING_KEY))

  try {
    const token = await jwtVerify(key, cryptoKey, {
      issuer: CALENDAR_ISSUER,
    })

    const sub = token.payload.sub

    if (sub === undefined) {
      throw new Error("subject was not present in signed token")
    }

    const serviceAccessToken = await getRpcServiceAccessToken()
    const serviceClient = createServerClientWithAccessToken(serviceAccessToken)
    const { items: eventDetails } = await serviceClient.event.allByAttendingUserIdForCalendar.query({
      id: sub,
    })

    const calendar = createCalendar("Mine Online-arrangementer")

    for (const { event } of eventDetails) {
      calendar.createEvent(createCalendarEvent(event))
    }

    return createCalendarFeedResponse(calendar.toString())
  } catch (err) {
    if (err instanceof JWTClaimValidationFailed || err instanceof JWTInvalid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    logger.error(err)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
