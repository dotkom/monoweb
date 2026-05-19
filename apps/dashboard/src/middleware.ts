import {
  ACCESS_TOKEN_REQUEST_HEADER,
  createLogoutUrl,
  shouldPersistSessionTokensInMiddleware,
} from "@dotkomonline/utils"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { auth0 } from "@/lib/auth0"

function isRedirectResponse(response: NextResponse): boolean {
  return response.status >= 300 && response.status < 400
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

  for (const cookie of authResponse.cookies.getAll()) {
    downstreamResponse.cookies.set(cookie)
  }

  return downstreamResponse
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
    console.error("[dashboard:middleware] failed to refresh session tokens", error)

    const logoutPath = createLogoutUrl({
      returnTo: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    })

    return NextResponse.redirect(new URL(logoutPath, request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
}
