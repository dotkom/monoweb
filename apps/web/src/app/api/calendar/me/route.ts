import { createSecretKey } from "node:crypto"
import { CALENDAR_ISSUER } from "@/app/api/calendar/ical"
import { auth } from "@/auth"
import { env } from "@/env"
import { SignJWT } from "jose"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest): Promise<NextResponse> {
  void req
  const session = await auth()
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = await new SignJWT({ sub: session.user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(CALENDAR_ISSUER)
    .sign(createSecretKey(Buffer.from(env.SIGNING_KEY)))
  return NextResponse.json({ token }, { status: 200 })
}
