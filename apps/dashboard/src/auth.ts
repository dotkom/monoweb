import { getLogger } from "@dotkomonline/logger"
import { OAuth2Service, OAuthScopes } from "@dotkomonline/oauth2"
import { createAuthenticationHandler } from "@dotkomonline/oauth2/nextjs"
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

export const auth = createAuthenticationHandler(oauth2Service, {
  redirectUrl: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/callback/auth0`,
  scopes: [OAuthScopes.Profile, OAuthScopes.Email, OAuthScopes.OpenID, OAuthScopes.OfflineAccess],
  host: env.NEXT_PUBLIC_ORIGIN,
  homeUrl: env.NEXT_PUBLIC_ORIGIN,
  signingKey: env.AUTH_SECRET,
  logger: oauth2Logger,
})
