import { createSecretKey } from "node:crypto"
import { SignJWT } from "jose"
import { type NextRequest, NextResponse } from "next/server"
import { CALENDAR_ISSUER } from "@/app/api/calendar/ical"
import { auth } from "@/auth"
import { env } from "@/env"

export async function GET(_: NextRequest): Promise<NextResponse> {
  const session = await auth.getServerSession()
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const token = await new SignJWT({ sub: session.sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(CALENDAR_ISSUER)
    .sign(createSecretKey(Buffer.from(env.SIGNING_KEY)))
  return NextResponse.json({ token }, { status: 200 })
}
