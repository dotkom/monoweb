import { createSecretKey } from "node:crypto"
import { CALENDAR_ISSUER, createCalendarEvent } from "@/app/api/calendar/ical"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { getLogger } from "@dotkomonline/logger"
import ical from "ical-generator"
import { jwtVerify } from "jose"
import { JWTClaimValidationFailed, JWTInvalid } from "jose/errors"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
    const events = await server.event.allByUserId.query({
      id: sub,
    })
    const calendar = ical({ name: "Online Linjeforening Arrangementer", prodId: "online.ntnu.no" })
    for (const event of events) {
      calendar.createEvent(createCalendarEvent(event))
    }
    return new NextResponse(calendar.toString(), {
      status: 200,
    })
  } catch (err) {
    if (err instanceof JWTClaimValidationFailed || err instanceof JWTInvalid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
