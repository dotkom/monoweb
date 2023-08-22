import NextAuth from "next-auth"
import { getAuthOptions } from "@dotkomonline/auth/src/auth-options"
import { env } from "@dotkomonline/env"

export const authOptions = getAuthOptions({
  cognitoClientId: env.DASHBOARD_COGNITO_CLIENT_ID,
  cognitoClientSecret: env.DASHBOARD_COGNITO_CLIENT_SECRET,
  cognitoIssuer: env.DASHBOARD_COGNITO_ISSUER,
})

export default NextAuth(authOptions)
