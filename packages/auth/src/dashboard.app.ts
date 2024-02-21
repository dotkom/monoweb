import { env } from "@dotkomonline/env"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import { getAuthOptions } from "./auth-options"

export const authOptions = getAuthOptions({
  cognitoClientId: env.DASHBOARD_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.DASHBOARD_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.DASHBOARD_COGNITO_ISSUER,
  core: await createServiceLayer({ db: kysely }),
  jwtSecret: env.NEXTAUTH_SECRET,
})
