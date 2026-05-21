import {
  ACCESS_TOKEN_REQUEST_HEADER,
  createLogoutUrl,
  shouldPersistSessionTokensInMiddleware,
  toAbsoluteUrl,
} from "@dotkomonline/utils"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"

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

function redirectToLogout(request: NextRequest, authResponse: NextResponse): NextResponse {
  const logoutPath = createLogoutUrl({
    returnTo: toAbsoluteUrl(request.nextUrl.origin, `${request.nextUrl.pathname}${request.nextUrl.search}`),
  })

  const response = NextResponse.redirect(new URL(logoutPath, request.url))
  copyResponseCookies(authResponse, response)

  return response
}

export async function middleware(request: NextRequest) {
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

  try {
    const { token } = await auth0.getAccessToken(request, authResponse)

    return forwardRefreshedAccessToken(request, authResponse, token)
  } catch (error) {
    console.error("[web:middleware] failed to refresh session tokens", error)

    return redirectToLogout(request, authResponse)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
