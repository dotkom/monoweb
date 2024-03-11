import { NextRequest, NextResponse } from "next/server"
import { env } from "@dotkomonline/env"
import { createVerifier, tryRefreshToken } from "@dotkomonline/jwt-crypto"
import { getToken } from "next-auth/jwt"

const getBaseUrl = () => {
  // TODO: Replace with trpc gateway url
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    return "https://web.online.ntnu.no"
  }
  return "http://localhost:3000"
}

const getProxyUrl = (req: NextRequest) => {
  const source = new URL(req.url)
  const target = new URL(source.pathname, getBaseUrl())
  for (const [key, value] of source.searchParams) {
    target.searchParams.set(key, value)
  }
  return target
}

const isJwtExpiredError = (error: unknown): boolean => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "function" &&
    error.code() === "ERR_JWT_EXPIRED"
  )
}

const verifierPromise = createVerifier(env.DASHBOARD_AUTH0_ISSUER)

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
  const verifier = await verifierPromise
  try {
    // Attempt to verify the token, and forward the request if successful.
    void (await verifier(token.accessToken))
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
      const accessToken = await tryRefreshToken({
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
  matcher: ["/api/trpc/:path*"],
}
