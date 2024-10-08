import type { ServiceLayer } from "@dotkomonline/core"
import { getServerSession, type DefaultSession, type DefaultUser, type NextAuthOptions, type User } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import Providers from 'next-auth/providers';
import { redirect } from "next/navigation";

interface Auth0IdTokenClaims {
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
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
    user: User
    sub: string
    id: string
  }

  interface User extends DefaultUser {
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
      profile: (profile: Auth0IdTokenClaims): User => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture ?? undefined,
        // givenName: profile.given_name,
        // familyName: profile.family_name,
      }),
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.sub = token.sub
        return session
      }

      return session
    }
  },
})
