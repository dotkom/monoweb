import { Auth0Client } from "@auth0/nextjs-auth0/server"
import type { AppRouter } from "@dotkomonline/rpc"
import { AUTH0_TOKEN_REFRESH_BUFFER_SECONDS, AuthErrorCode, createLogoutUrl, toAbsoluteUrl } from "@dotkomonline/utils"
import * as trpc from "@trpc/client"
import { hoursToSeconds } from "date-fns"
import { NextResponse } from "next/server"
import superjson from "superjson"
import { env } from "@/env"
import { Auth0JwtService } from "@/lib/auth0-jwt"

const REGISTER_MAX_ATTEMPTS = 2 as const
const REGISTER_RETRY_DELAY_MS = 500 as const

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

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

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

  // In case Auth0 Management API and RPC are briefly unavailable right after callback (cold start, propagation lag), we
  // retry once.
  for (let attempt = 0; attempt < REGISTER_MAX_ATTEMPTS; attempt++) {
    try {
      const jwt = await jwtService.verify(accessToken)

      if (!jwt.payload.sub) {
        throw new Error("No sub in JWT")
      }

      await client.user.register.mutate(jwt.payload.sub)
      return { ok: true }
    } catch (error) {
      console.error(`[web:auth0] register attempt ${attempt + 1} failed`, error)

      if (attempt === 0) {
        await wait(REGISTER_RETRY_DELAY_MS)
      }
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
  tokenRefreshBuffer: AUTH0_TOKEN_REFRESH_BUFFER_SECONDS,
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
        const returnToUrl = new URL(env.NEXT_PUBLIC_ORIGIN)
        returnToUrl.searchParams.set("error", registerResult.code)

        const logoutPath = createLogoutUrl({
          returnTo: toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, `${returnToUrl.pathname}${returnToUrl.search}`),
        })

        return NextResponse.redirect(new URL(logoutPath, env.NEXT_PUBLIC_ORIGIN))
      }
    }

    const baseUrl = ctx.appBaseUrl ?? env.NEXT_PUBLIC_ORIGIN

    return NextResponse.redirect(new URL(ctx.returnTo ?? "/", baseUrl))
  },
})
