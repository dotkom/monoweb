import type { ServiceLayer } from "@dotkomonline/core"
import type { DefaultSession, DefaultUser, NextAuthOptions, User } from "next-auth"
import type { DefaultJWT, JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"

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
    name: string
    email: string
    image?: string
    givenName?: string
    familyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, Record<string, unknown> {
    accessToken?: string
    refreshToken?: string
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
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        await core.auth0SynchronizationService.populateUserWithFakeData(token.sub, token.email) // Remove when we have real data
        const user = await core.auth0SynchronizationService.ensureUserLocalDbIsSynced(token.sub, new Date())

        session.user.id = user.auth0Id
        session.sub = token.sub
        return session
      }

      return session
    },
  },
})
