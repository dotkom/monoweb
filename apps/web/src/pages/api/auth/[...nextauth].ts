import { env } from "@/env"
import { getAuthOptions } from "@dotkomonline/auth"
import NextAuth from "next-auth"

export const authOptions = getAuthOptions({
  auth0ClientId: env.OAUTH_CLIENT_ID,
  auth0ClientSecret: env.OAUTH_CLIENT_SECRET,
  auth0Issuer: env.OAUTH_ISSUER,
  jwtSecret: env.NEXTAUTH_SECRET,
  rpcHost: env.RPC_HOST,
  cookieName: env.NEXTAUTH_COOKIE_NAME,
})

export default NextAuth(authOptions)
