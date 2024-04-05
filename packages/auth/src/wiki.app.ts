import { getAuthOptions } from "./auth-options"
import { env } from "@dotkomonline/env"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"

export const authOptions = getAuthOptions({
  auth0ClientId: env.WIKI_AUTH0_CLIENT_ID,
  auth0ClientSecret: env.WIKI_AUTH0_CLIENT_SECRET,
  auth0Issuer: env.WIKI_AUTH0_ISSUER,
  core: await createServiceLayer({ db: kysely }),
  jwtSecret: env.NEXTAUTH_SECRET,
})
