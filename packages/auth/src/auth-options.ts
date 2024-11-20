import type { ServiceLayer } from "@dotkomonline/core"
import type { User } from "@dotkomonline/types"
import type { DefaultSession, DefaultUser, NextAuthOptions } from "next-auth"
import type { DefaultJWT, JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"

interface Auth0IdTokenClaims {
  sub: string
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  updated_at: string
  email: string
  email_verified: boolean
  iss: string
  aud: string
  iat: number
  exp: number
  sid: string
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User
    sub: string
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
      profile: (profile: Auth0IdTokenClaims) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
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
        const user: User | null = await core.userService.getById(token.sub)

        if (user === null) {
          throw new Error(`Failed to fetch user with id ${token.sub}`)
        }

        session.user = user
      }

      return session
    },
  },
})
