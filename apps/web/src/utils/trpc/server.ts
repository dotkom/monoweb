import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import * as trpc from "@trpc/client"
import { getToken } from "next-auth/jwt"
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies"
import { cookies, headers } from "next/headers"
import type { NextRequest } from "next/server"
import superjson from "superjson"

/**
 * Get the Auth0-issued JWT token on the server side.
 *
 * This is a slight hack because Next does not give you access to the request
 * on the server, so we emulate a "fake" request that gives next-auth just
 * enough data to get the token from cookies/headers
 *
 * This function also has to account for the edge case during SSG where there
 * are no headers or cookies available at all
 */
async function getTokenServerside() {
  // If we are in SSG, we do not have a token available at all
  try {
    const requestHeaders = await headers()
    const requestCookies = await cookies()
    // TODO: Maybe we should just construct NextRequest and encode the cookies
    //  ourselves?
    const request = {
      headers: requestHeaders,
      cookies: requestCookies as unknown as RequestCookies,
    } as NextRequest
    return await getToken({ req: request, secret: env.AUTH_SECRET })
  } catch {
    return null
  }
}

export const server = trpc.createTRPCProxyClient<AppRouter>({
  links: [
    trpc.httpLink({
      transformer: superjson,
      url: `${env.RPC_HOST}/api/trpc`,
      headers: async () => {
        const token = await getTokenServerside()
        if (token !== null) {
          return { Authorization: `Bearer ${token.accessToken}` }
        }
        return {}
      },
    }),
  ],
})
