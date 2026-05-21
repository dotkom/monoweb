import {
  ACCESS_TOKEN_REQUEST_HEADER,
  CLEAR_SESSION_ENDPOINT,
  createClearSessionUrl,
  getAuthSessionCookieNamesToClear,
  isAccessTokenFetchFailure,
  isAccessTokenUsable,
  shouldPersistSessionTokensInMiddleware,
  toAbsoluteUrl,
  toSameOriginAbsoluteUrl,
} from "@dotkomonline/utils"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { AUTH0_SESSION_COOKIE_NAME, auth0 } from "@/lib/auth0"

function isRedirectResponse(response: NextResponse): boolean {
  return response.status >= 300 && response.status < 400
}

function copyResponseCookies(source: NextResponse, target: NextResponse): void {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }
}

function forwardRefreshedAccessToken(
  request: NextRequest,
  authResponse: NextResponse,
  accessToken: string
): NextResponse {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(ACCESS_TOKEN_REQUEST_HEADER, accessToken)

  const downstreamResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Auth0 sets refreshed session cookies on `authResponse`. A bare `NextResponse.next()` would drop them.
  copyResponseCookies(authResponse, downstreamResponse)

  return downstreamResponse
}

function clearLocalAuthSession(request: NextRequest): NextResponse {
  const returnTo = toSameOriginAbsoluteUrl(request.nextUrl.origin, request.nextUrl.searchParams.get("returnTo"))
  const response = NextResponse.redirect(returnTo)

  const cookies = request.cookies.getAll().map((cookie) => cookie.name)
  const cookieNamesToClear = getAuthSessionCookieNamesToClear(cookies, AUTH0_SESSION_COOKIE_NAME)

  for (const cookieName of cookieNamesToClear) {
    response.cookies.set(cookieName, "", { path: "/", maxAge: 0 })
  }

  return response
}

function redirectToClearSession(request: NextRequest, authResponse: NextResponse): NextResponse {
  const clearSessionPath = createClearSessionUrl({
    returnTo: toAbsoluteUrl(request.nextUrl.origin, `${request.nextUrl.pathname}${request.nextUrl.search}`),
  })

  const response = NextResponse.redirect(new URL(clearSessionPath, request.url))
  copyResponseCookies(authResponse, response)

  return response
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === CLEAR_SESSION_ENDPOINT && request.method === "GET") {
    return clearLocalAuthSession(request)
  }

  const authResponse = await auth0.middleware(request)

  if (!shouldPersistSessionTokensInMiddleware(request.nextUrl.pathname)) {
    return authResponse
  }

  if (isRedirectResponse(authResponse)) {
    return authResponse
  }

  const session = await auth0.getSession(request)

  if (session === null) {
    return authResponse
  }

  const sessionToken = session.tokenSet?.accessToken

  // If we already have a valid access token, we use it
  if (sessionToken !== undefined && sessionToken !== "" && isAccessTokenUsable(sessionToken)) {
    return forwardRefreshedAccessToken(request, authResponse, sessionToken)
  }

  try {
    const { token } = await auth0.getAccessToken(request, authResponse)

    return forwardRefreshedAccessToken(request, authResponse, token)
  } catch (error) {
    console.error("[web:middleware] failed to refresh session tokens", error)

    if (isAccessTokenFetchFailure(error)) {
      return redirectToClearSession(request, authResponse)
    }

    return authResponse
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
