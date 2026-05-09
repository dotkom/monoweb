import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { AppRouter } from "@dotkomonline/rpc"
import * as trpc from "@trpc/client"
import { hoursToSeconds, minutesToSeconds } from "date-fns"
import { NextResponse } from "next/server"
import superjson from "superjson"
import { env } from "@/env"
import { Auth0JwtService } from "@/lib/auth0-jwt"

const jwtService = new Auth0JwtService(
  env.AUTH0_ISSUER,
  env.AUTH0_AUDIENCES.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
)

const auth0Domain = new URL(env.AUTH0_ISSUER).hostname

const primaryApiAudience =
  env.AUTH0_AUDIENCES.split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0] ?? ""

async function registerUserAfterSignIn(accessToken: string): Promise<void> {
  const client = trpc.createTRPCClient<AppRouter>({
    links: [
      trpc.httpLink({
        transformer: superjson,
        url: `${env.RPC_HOST}/api/trpc`,
        headers: async () => ({
          Authorization: `Bearer ${accessToken}`,
        }),
      }),
    ],
  })

  try {
    const jwt = await jwtService.verify(accessToken)

    if (!jwt.payload.sub) {
      throw new Error("No sub in JWT")
    }

    await client.user.register.mutate(jwt.payload.sub)
  } catch (err) {
    console.error("[web:auth0] failed to verify access token or register user", err)
  }
}

export const auth0 = new Auth0Client({
  domain: auth0Domain,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  secret: env.AUTH_SECRET,
  appBaseUrl: env.NEXT_PUBLIC_ORIGIN,
  authorizationParameters: {
    audience: primaryApiAudience,
    scope: "openid profile email offline_access",
  },
  session: {
    rolling: true,
    absoluteDuration: hoursToSeconds(24 * 90),
    inactivityDuration: hoursToSeconds(24 * 30),
  },
  tokenRefreshBuffer: minutesToSeconds(1),
  routes: {
    login: "/api/auth/authorize",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback/auth0",
  },
  signInReturnToPath: "/",

  async onCallback(error, ctx, session) {
    if (error !== null) {
      const url = new URL(env.NEXT_PUBLIC_ORIGIN)
      url.searchParams.set("error", error.message)

      return NextResponse.redirect(url)
    }

    if (session?.tokenSet?.accessToken !== undefined && session.tokenSet.accessToken !== "") {
      await registerUserAfterSignIn(session.tokenSet.accessToken)
    }

    const baseUrl = ctx.appBaseUrl ?? env.NEXT_PUBLIC_ORIGIN

    return NextResponse.redirect(new URL(ctx.returnTo ?? "/", baseUrl))
  },
})
