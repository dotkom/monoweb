import type { ServiceLayer } from "@dotkomonline/core"
import { type User } from "@dotkomonline/types"
import type { DefaultSession, DefaultUser, NextAuthOptions } from "next-auth"
import Auth0Provider, { Auth0Profile } from "next-auth/providers/auth0"

interface Auth0IdTokenClaims {
  gender: string
  updated_at: string
  email: string
  email_verified: boolean
  iss: string
  aud: string
  iat: number
  exp: number
  sub: string
  sid: string
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: User
    sub: string
    id: string
  }
}

export interface AuthOptions {
  auth0ClientId: string
  auth0ClientSecret: string
  auth0Issuer: string
  core: ServiceLayer
  jwtSecret: string
}

export const getAuthOptions = ({
  auth0ClientId: oidcClientId,
  auth0ClientSecret: oidcClientSecret,
  auth0Issuer: oidcIssuer,
  core,
  jwtSecret,
}: AuthOptions): NextAuthOptions => ({
  secret: jwtSecret,
  providers: [
    Auth0Provider({
      clientId: oidcClientId,
      clientSecret: oidcClientSecret,
      issuer: oidcIssuer,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        await core.userService.registerId(token.sub)
        const user = await core.userService.getById(token.sub)

        if (!user) {
          console.warn(`User with id ${token.sub} not found`)
          return session
        }

        session.user = user

        return session
      }

      return session
    },
  },
})
