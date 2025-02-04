import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import * as trpc from "@trpc/client"
import { getToken } from "next-auth/jwt"
import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies, headers } from "next/headers"
import type { NextRequest } from "next/server"
import superjson from "superjson"

/*
This hack is needed because some genius at next auth decided to make the only api to get the token from jwt require a request object
https://github.com/nextauthjs/next-auth/blob/31ead6df29c508b8177f6e088cd4f11f3a341886/packages/core/src/jwt.ts#L141
Discussion:
https://github.com/nextauthjs/next-auth/issues/7913
*/
async function getTokenServerside({ headers, cookies }: { headers: ReadonlyHeaders; cookies: ReadonlyRequestCookies }) {
  return await getToken({
    req: {
      headers: headers,
      cookies: cookies as unknown as RequestCookies,
    } as NextRequest,
  })
}

export const server = trpc.createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    trpc.httpLink({
      url: `${env.RPC_HOST}/api/trpc`,
      headers: async () => {
        const token = await getTokenServerside({ headers: await headers(), cookies: await cookies() })

        if (!token) {
          return {}
        }

        return {
          Authorization: `Bearer ${token}`,
        }
      },
    }),
  ],
})
