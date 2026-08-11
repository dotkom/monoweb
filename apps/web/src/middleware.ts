import {
  createClearSessionUrl,
  isAccessTokenFetchFailure,
  isAccessTokenUsable,
  toAbsoluteUrl,
} from "@dotkomonline/utils"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth0 } from "@/lib/auth0"

function redirectToClearSession(request: NextRequest): NextResponse {
  const clearSessionPath = createClearSessionUrl({
    returnTo: toAbsoluteUrl(request.nextUrl.origin, `${request.nextUrl.pathname}${request.nextUrl.search}`),
  })

  return NextResponse.redirect(new URL(clearSessionPath, request.url))
}

export async function middleware(request: NextRequest) {
  // The Auth0 middleware creates the authorize, callback, logout and access-token endpoints for us. On normal requests
  // it also extends the session cookie lifetime when the user has a session.
  const authResponse = await auth0.middleware(request)

  // Auth0 handles the token lifecycle and callback session creation for its own endpoints.
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return authResponse
  }

  // Pass redirects from Auth0 directly to the browser.
  if (authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse
  }

  const session = await auth0.getSession(request)

  // Requests with no session continue to the pages and RPC procedures, where access is decided.
  if (session === null) {
    return authResponse
  }

  const sessionToken = session.tokenSet?.accessToken

  // A usable access token continues to the requested page. Tokens inside the refresh buffer are renewed below.
  if (sessionToken !== undefined && sessionToken !== "" && isAccessTokenUsable(sessionToken)) {
    return authResponse
  }

  try {
    // Auth0 writes the refreshed session to both the request and response cookies. The current render reads the new
    // token from the request, and the browser stores it from the response.
    await auth0.getAccessToken(request, authResponse)
  } catch (error) {
    console.error("[web:middleware] failed to refresh session tokens", error)

    if (isAccessTokenFetchFailure(error)) {
      // A missing or rejected refresh token marks the local session as stale. The clear-session route deletes its
      // cookies and returns the user to the requested page.
      return redirectToClearSession(request)
    }
  }

  return authResponse
}

export const config = {
  matcher: [
    // Route the SDK's authorize, callback, logout and access-token endpoints through middleware
    "/api/auth/:path*",
    {
      // Run middleware for normal page requests while omitting static files and Next.js prefetch requests
      source: "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
