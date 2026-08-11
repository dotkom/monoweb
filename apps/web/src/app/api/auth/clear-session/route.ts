import { AUTH0_SESSION_COOKIE_NAME } from "@/lib/auth0"
import { getAuthSessionCookieNamesToClear, toSameOriginAbsoluteUrl } from "@dotkomonline/utils"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function GET(request: NextRequest): NextResponse {
  // This route handles a local session containing a refresh token that Auth0 rejected. It deletes the stale session
  // cookies and lets the user sign in again when needed.
  //
  // The returnTo value comes from the request that discovered the broken session. It is restricted to our own origin
  // before redirecting.
  const returnTo = toSameOriginAbsoluteUrl(request.nextUrl.origin, request.nextUrl.searchParams.get("returnTo"))
  const response = NextResponse.redirect(returnTo)
  const requestCookieNames = request.cookies.getAll().map((cookie) => cookie.name)
  const cookieNamesToClear = getAuthSessionCookieNamesToClear(requestCookieNames, AUTH0_SESSION_COOKIE_NAME)

  // Auth0 splits large sessions into several cookies. Delete every Auth0 cookie present on the request, including each
  // part of a chunked session.
  for (const cookieName of cookieNamesToClear) {
    response.cookies.set(cookieName, "", { path: "/", maxAge: 0 })
  }

  return response
}
