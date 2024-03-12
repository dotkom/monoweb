import { getRefreshToken, isJwtExpiredError, JwtService } from "@dotkomonline/jwt-crypto"
import { NextRequest, NextResponse } from "next/server"
import { DefaultJWT, getToken } from "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown>, DefaultJWT {
    accessToken?: string
    refreshToken?: string
  }
}

export interface MiddlewareOptions {
  issuer: string
  clientId: string
  clientSecret: string
  gatewayUrl: string
  proxyBase?: string
  targetBase?: string
}

export const createMiddleware = ({
  issuer,
  clientId,
  clientSecret,
  gatewayUrl,
  proxyBase = "/api/proxy/trpc",
  targetBase = "/api/trpc",
}: MiddlewareOptions) => {
  // It's important that each instatiation of the middleware has its own
  // instance of the JwtService, as it could technically vary across different
  // instances of the middleware.
  const jwtService = new JwtService(issuer)
  const getCompleteProxyUrl = (req: NextRequest): URL => {
    const source = new URL(req.url)
    const relativePathName = source.pathname.replace(proxyBase, targetBase)
    const target = new URL(relativePathName, gatewayUrl)
    for (const [key, value] of source.searchParams) {
      target.searchParams.set(key, value)
    }
    return target
  }

  return async function middleware(req: NextRequest): Promise<NextResponse> {
    const endpoint = getCompleteProxyUrl(req)
    const token = await getToken({ req })
    // If this is an unauthenticated request, we'll just pass it through to the
    // trpc server without any modifications.
    if (token === null || token?.accessToken === undefined) {
      return NextResponse.rewrite(endpoint, {
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
      return NextResponse.rewrite(endpoint, {
        request: {
          headers: req.headers,
        },
      })
    } catch (error) {
      // If the token has expired, and we have a refresh token, we'll attempt to
      // refresh the token and forward the request with the new token.
      if (isJwtExpiredError(error) && token.refreshToken !== undefined) {
        const accessToken = await getRefreshToken({
          issuer,
          refreshToken: token.refreshToken,
          clientId,
          clientSecret,
        })
        req.headers.set("Authorization", `Bearer ${accessToken}`)
        return NextResponse.rewrite(endpoint, {
          request: {
            headers: req.headers,
          },
        })
      }
      // If both the access token and the refresh token are invalid, we'll
      // return a 401 Unauthorized response to the client.
      return NextResponse.next({
        status: 401,
      })
    }
  }
}
