import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import { env } from "@dotkomonline/env"
import { getAuthOptions } from "./auth-options"

export const authOptions = getAuthOptions({
  auth0ClientId: env.WEB_AUTH0_CLIENT_ID,
  auth0ClientSecret: env.WEB_AUTH0_CLIENT_SECRET,
  auth0Issuer: env.WEB_AUTH0_ISSUER,
  core: await createServiceLayer({ db: kysely }),
  jwtSecret: env.NEXTAUTH_SECRET,
})
