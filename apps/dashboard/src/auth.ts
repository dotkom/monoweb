import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { getLogger } from "@dotkomonline/logger"
import { OAuth2Service, OAuthScopes } from "@dotkomonline/oauth2"
import { createAuthenticationHandler } from "@dotkomonline/oauth2/nextjs"
import * as trpc from "@trpc/client"
import { createRemoteJWKSet, jwtVerify } from "jose"
import superjson from "superjson"
import { env } from "./env"

const oauth2Logger = getLogger("dashboard:oauth2")

const oauth2Service = new OAuth2Service(
  oauth2Logger,
  fetch,
  env.OAUTH_ISSUER,
  env.OAUTH_CLIENT_ID,
  env.OAUTH_CLIENT_SECRET,
  env.NEXT_PUBLIC_ORIGIN
)

const jwks = createRemoteJWKSet(new URL(`${env.OAUTH_ISSUER}/.well-known/jwks.json`))

export const auth = createAuthenticationHandler(oauth2Service, {
  redirectUrl: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/callback/auth0`,
  scopes: [OAuthScopes.Profile, OAuthScopes.Email, OAuthScopes.OpenID, OAuthScopes.OfflineAccess],
  host: env.NEXT_PUBLIC_ORIGIN,
  homeUrl: env.NEXT_PUBLIC_ORIGIN,
  signingKey: env.AUTH_SECRET,
  logger: oauth2Logger,
  async onSignIn(session) {
    const client = trpc.createTRPCClient<AppRouter>({
      links: [
        trpc.httpLink({
          transformer: superjson,
          url: `${env.RPC_HOST}/api/trpc`,
          headers: async () => ({
            Authorization: `Bearer ${session.accessToken}`,
          }),
        }),
      ],
    })
    try {
      const jwt = await jwtVerify(session.accessToken, jwks, {
        clockTolerance: "5s",
        algorithms: ["RS256"],
        // Auth0's issuer contains a trailing slash, but Next Auth does not
        issuer: `${env.OAUTH_ISSUER}/`,
        // audience: this.audiences,
        typ: "JWT",
      })
      if (!jwt.payload.sub) {
        throw new Error("No sub in JWT")
      }
      await client.user.registerAndGet.mutate(jwt.payload.sub)
    } catch (err) {
      oauth2Logger.error("failed to verify access token", err)
    }
  },
})
