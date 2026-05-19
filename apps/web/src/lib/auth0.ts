import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { AppRouter } from "@dotkomonline/rpc"
import { AuthErrorCode } from "@dotkomonline/utils"
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

type RegisterUserResult = { ok: true } | { ok: false; code: typeof AuthErrorCode.REGISTER_FAILED }

async function registerUserAfterSignIn(accessToken: string): Promise<RegisterUserResult> {
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

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const jwt = await jwtService.verify(accessToken)

      if (!jwt.payload.sub) {
        throw new Error("No sub in JWT")
      }

      await client.user.register.mutate(jwt.payload.sub)
      return { ok: true }
    } catch (error) {
      console.error(`[web:auth0] register attempt ${attempt + 1} failed`, error)
    }
  }

  return { ok: false, code: AuthErrorCode.REGISTER_FAILED }
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
    cookie: {
      name: "onlineweb_session_web",
    },
  },
  tokenRefreshBuffer: minutesToSeconds(1),
  routes: {
    login: "/api/auth/authorize",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback/auth0",
    accessToken: env.NEXT_PUBLIC_ACCESS_TOKEN_ROUTE,
  },
  signInReturnToPath: "/",

  async onCallback(error, ctx, session) {
    if (error !== null) {
      console.error("[web:auth0] login callback error", error)

      const url = new URL(env.NEXT_PUBLIC_ORIGIN)
      url.searchParams.set("error", AuthErrorCode.LOGIN_FAILED)

      return NextResponse.redirect(url)
    }

    if (session?.tokenSet?.accessToken !== undefined && session.tokenSet.accessToken !== "") {
      const registerResult = await registerUserAfterSignIn(session.tokenSet.accessToken)

      if (!registerResult.ok) {
        const errorUrl = new URL(env.NEXT_PUBLIC_ORIGIN)
        errorUrl.searchParams.set("error", registerResult.code)

        return NextResponse.redirect(errorUrl)
      }
    }

    const baseUrl = ctx.appBaseUrl ?? env.NEXT_PUBLIC_ORIGIN

    return NextResponse.redirect(new URL(ctx.returnTo ?? "/", baseUrl))
  },
})
