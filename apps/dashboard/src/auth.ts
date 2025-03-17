import { createAuthConfig } from "@dotkomonline/auth"
import NextAuth from "next-auth"
import { env } from "./env"

export const { auth, handlers, signIn, signOut } = NextAuth(
  createAuthConfig({
    auth0ClientId: env.OAUTH_CLIENT_ID,
    auth0ClientSecret: env.OAUTH_CLIENT_SECRET,
    auth0Issuer: env.OAUTH_ISSUER,
    jwtSecret: env.AUTH_SECRET,
    rpcHost: env.RPC_HOST,
  })
)
