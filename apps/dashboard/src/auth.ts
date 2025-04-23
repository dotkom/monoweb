import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { getLogger } from "@dotkomonline/logger"
import { OAuth2Service, OAuthScopes } from "@dotkomonline/oauth2"
import { JwtService } from "@dotkomonline/oauth2/jwt"
import { createAuthenticationHandler } from "@dotkomonline/oauth2/nextjs"
import * as trpc from "@trpc/client"
import superjson from "superjson"
import { env } from "./env"

const oauth2Logger = getLogger("dashboard:oauth2")
const jwtService = new JwtService(env.OAUTH_ISSUER, [])
const oauth2Service = new OAuth2Service(
  oauth2Logger,
  fetch,
  env.OAUTH_ISSUER,
  env.OAUTH_CLIENT_ID,
  env.OAUTH_CLIENT_SECRET,
  env.NEXT_PUBLIC_ORIGIN
)

export const auth = createAuthenticationHandler(oauth2Service, {
  redirectUrl: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/callback/auth0`,
  scopes: [OAuthScopes.Profile, OAuthScopes.Email, OAuthScopes.OpenID, OAuthScopes.OfflineAccess],
  host: env.NEXT_PUBLIC_ORIGIN,
  homeUrl: `${env.NEXT_PUBLIC_ORIGIN}/event`,
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
      const jwt = await jwtService.verify(session.accessToken)
      if (!jwt.payload.sub) {
        throw new Error("No sub in JWT")
      }

      // This is a temporary solution to only allow specific users to access the dashboard.
      // Value of * is used in dev and staging to allow all users to use dashboard.
      // In prod a list of auth0 subs is used to allow only specific users to use dashboard.
      const adminUsers = env.ADMIN_USER_AUTH0_SUBS.split(",")
      if (!adminUsers.includes("*") && !adminUsers.includes(jwt.payload.sub)) {
        throw new Error("Unauthorized: your auth0 sub is not in the ADMIN_USER_AUTH0_SUBS env variable")
      }

      await client.user.registerAndGet.mutate(jwt.payload.sub)
    } catch (err) {
      oauth2Logger.error("failed to verify access token", err)
    }
  },
})
