import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import { env } from "@dotkomonline/env"
import { getAuthOptions } from "./auth-options"

export const authOptions = getAuthOptions({
  cognitoClientId: env.WEB_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.WEB_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.WEB_COGNITO_ISSUER,
  core: await createServiceLayer({ db: kysely }),
})
