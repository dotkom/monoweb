import { createAuthServiceLayer, getAuthOptions } from "@dotkomonline/auth"
import NextAuth from "next-auth"
import { env } from "../../../env"

export const authOptions = getAuthOptions({
  auth0ClientId: env.OAUTH_CLIENT_ID,
  auth0ClientSecret: env.OAUTH_CLIENT_SECRET,
  auth0Issuer: env.OAUTH_ISSUER,
  authServiceLayer: createAuthServiceLayer(env.DATABASE_URL),
  jwtSecret: env.NEXTAUTH_SECRET,
})

export default NextAuth(authOptions)
