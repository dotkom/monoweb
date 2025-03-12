import { env } from "@/env"
import type { AppRouter } from "@dotkomonline/gateway-trpc"
import * as trpc from "@trpc/client"
import { getToken } from "next-auth/jwt"
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies"
import { cookies, headers } from "next/headers"
import type { NextRequest } from "next/server"
import superjson from "superjson"

/*
This hack is needed because some genius at next auth decided to make the only api to get the token from jwt require a request object
https://github.com/nextauthjs/next-auth/blob/31ead6df29c508b8177f6e088cd4f11f3a341886/packages/core/src/jwt.ts#L141

Discussion:
https://github.com/nextauthjs/next-auth/issues/7913

This can be replaced by auth() in next-auth 5, but it is still in beta
*/
async function getTokenServerside() {
  let reqHeaders: ReadonlyHeaders
  let reqCookies: ReadonlyRequestCookies

  // If we in for example static generation, we don't have headers or cookies available.
  try {
    reqHeaders = await headers()
    reqCookies = await cookies()
  } catch (e) {
    return null
  }
  return await getToken({
    req: {
      headers: reqHeaders,
      cookies: reqCookies as unknown as RequestCookies,
    } as NextRequest,
  })
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
