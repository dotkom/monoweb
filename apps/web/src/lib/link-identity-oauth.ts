import { addSeconds } from "date-fns"
import * as oauth from "oauth4webapi"
import { z } from "zod"

const LinkIdentityTokenResponse = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  id_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  token_type: z.literal("Bearer"),
})

export type LinkIdentityTokenSet = {
  accessToken: string
  refreshToken?: string
  idToken: string
  expiresAt: number
}

export type LinkIdentityScope = "openid" | "profile" | "email"

export function getScopeSet(...scopes: LinkIdentityScope[]): string {
  return scopes.join(" ")
}

export async function createLinkIdentityAuthorizeUrl(options: {
  issuerUrl: string
  clientId: string
  redirectUrl: string
  scopes: LinkIdentityScope[]
  connection?: string
}): Promise<{ url: URL; state: string; verifier: string }> {
  const verifier = oauth.generateRandomCodeVerifier()
  const challenge = await oauth.calculatePKCECodeChallenge(verifier)
  const state = oauth.generateRandomState()

  const url = new URL("/oauth/authorize", options.issuerUrl)
  url.searchParams.set("client_id", options.clientId)
  url.searchParams.set("redirect_uri", options.redirectUrl)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("response_mode", "query")
  url.searchParams.set("scope", getScopeSet(...options.scopes))
  url.searchParams.set("state", state)
  url.searchParams.set("code_challenge", challenge)
  url.searchParams.set("code_challenge_method", "S256")

  if (options.connection !== undefined && options.connection !== "") {
    url.searchParams.set("connection", options.connection)
  }

  return { url, state, verifier }
}

export async function exchangeLinkIdentityCode(options: {
  issuerUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
  verifier: string
  fetchImplementation?: typeof fetch
}): Promise<LinkIdentityTokenSet> {
  const fetchImplementation = options.fetchImplementation ?? fetch
  const url = new URL("/oauth/token", options.issuerUrl)

  const response = await fetchImplementation(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.redirectUri,
      code: options.code,
      code_verifier: options.verifier,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))

    throw new Error(`token request failed: ${JSON.stringify(errorBody)}`)
  }

  const payload = await response.json()
  const parsed = LinkIdentityTokenResponse.safeParse(payload)

  if (!parsed.success) {
    throw new Error("failed to parse token response for link-identity")
  }

  const expiresAt = addSeconds(Date.now(), parsed.data.expires_in).getTime()

  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token,
    idToken: parsed.data.id_token,
    expiresAt,
  }
}
