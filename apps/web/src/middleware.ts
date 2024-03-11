import { NextRequest, NextResponse } from "next/server"
import { env } from "@dotkomonline/env"
import { JwtService, getRefreshToken, isJwtExpiredError } from "@dotkomonline/jwt-crypto"
import { getToken } from "next-auth/jwt"

const getProxyUrl = (req: NextRequest) => {
  // TODO: Replace this with the tRPC server URL once it's available.
  const baseUrl = env.NEXT_PUBLIC_NODE_ENV === "production" ? "https://web.online.ntnu.no" : "http://localhost:3000"
  const source = new URL(req.url)
  const relativePathName = source.pathname.replace("/api/proxy/trpc", "/api/trpc")
  const target = new URL(relativePathName, baseUrl)
  for (const [key, value] of source.searchParams) {
    target.searchParams.set(key, value)
  }
  return target
}

const jwtService = new JwtService(env.GTX_AUTH0_ISSUER)

export async function middleware(req: NextRequest) {
  const target = getProxyUrl(req)
  const token = await getToken({ req })
  // If this is an unauthenticated request, we'll just pass it through to the
  // trpc server without any modifications.
  if (token === null || token?.accessToken === undefined) {
    return NextResponse.rewrite(target, {
      request: {
        headers: req.headers,
      },
    })
  }

  // Otherwise, we'll verify the token, and optionally refresh it if it has
  // expired. Then we'll pass the request through to the trpc server.
  try {
    // Attempt to verify the token, and forward the request if successful.
    await jwtService.verify(token.accessToken)
    req.headers.set("Authorization", `Bearer ${token.accessToken}`)
    return NextResponse.rewrite(target, {
      request: {
        headers: req.headers,
      },
    })
  } catch (error) {
    // If the token has expired, and we have a refresh token, we'll attempt to
    // refresh the token and forward the request with the new token.
    if (isJwtExpiredError(error) && token.refreshToken !== undefined) {
      const accessToken = await getRefreshToken({
        issuer: env.DASHBOARD_AUTH0_ISSUER,
        refreshToken: token.refreshToken,
        clientId: env.DASHBOARD_AUTH0_CLIENT_ID,
        clientSecret: env.DASHBOARD_AUTH0_CLIENT_SECRET,
      })
      req.headers.set("Authorization", `Bearer ${accessToken}`)
      return NextResponse.rewrite(target, {
        request: {
          headers: req.headers,
        },
      })
    }
    // If both the access token and the refresh token are invalid, we'll return
    // a 401 Unauthorized response to the client.
    return NextResponse.next({
      status: 401,
    })
  }
}

export const config = {
  matcher: ["/api/proxy/trpc/:path*"],
}
