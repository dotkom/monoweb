import { env } from "@/env"
import { addSeconds, isAfter } from "date-fns"
import { z } from "zod"

const ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS = 30

const AccessTokenResponse = z.object({
  access_token: z.string().min(1),
  expires_in: z.int().positive(),
  token_type: z.literal("Bearer"),
})

type CachedAccessToken = {
  accessToken: string
  expiresAt: Date
}

let cachedAccessToken: CachedAccessToken | null = null
let pendingAccessTokenRequest: Promise<CachedAccessToken> | null = null

async function requestAccessToken(): Promise<CachedAccessToken> {
  const audiences = env.AUTH0_AUDIENCES.split(",").map((audience) => audience.trim())
  const audience = audiences.find((candidate) => candidate !== "")

  if (audience === undefined) {
    throw new Error("No Auth0 API audience is configured")
  }

  const response = await fetch(new URL("/oauth/token", env.AUTH0_ISSUER), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      audience,
      client_id: env.AUTH0_CLIENT_ID,
      client_secret: env.AUTH0_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "read:calendar_feed",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Auth0 service token request failed with status ${response.status}`)
  }

  const payload: unknown = await response.json()
  const parsed = AccessTokenResponse.safeParse(payload)

  if (!parsed.success) {
    throw new Error("Auth0 returned an invalid service token response")
  }

  return {
    accessToken: parsed.data.access_token,
    expiresAt: addSeconds(new Date(), parsed.data.expires_in),
  }
}

export async function getRpcServiceAccessToken(): Promise<string> {
  const minimumExpiry = addSeconds(new Date(), ACCESS_TOKEN_EXPIRY_BUFFER_SECONDS)

  if (cachedAccessToken !== null && isAfter(cachedAccessToken.expiresAt, minimumExpiry)) {
    return cachedAccessToken.accessToken
  }

  if (pendingAccessTokenRequest === null) {
    pendingAccessTokenRequest = requestAccessToken().finally(() => {
      pendingAccessTokenRequest = null
    })
  }

  cachedAccessToken = await pendingAccessTokenRequest
  return cachedAccessToken.accessToken
}
