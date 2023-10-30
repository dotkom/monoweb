import { createServiceLayer } from "@dotkomonline/core"
import { getAuthOptions } from "./auth-options"
import { kysely } from "@dotkomonline/db"
import { env } from "@dotkomonline/env"

export const authOptions = getAuthOptions({
  cognitoClientId: env.WEB_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.WEB_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.WEB_COGNITO_ISSUER,
  core: await createServiceLayer({ db: kysely }),
})
