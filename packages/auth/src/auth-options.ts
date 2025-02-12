import { type User, UserSchema } from "@dotkomonline/types"
import type { DefaultSession, NextAuthOptions } from "next-auth"
import type { DefaultJWT, JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"
import { createServer } from "./trpc"

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
  jwtSecret: string
  rpcHost: string
}

export const getAuthOptions = ({
  auth0ClientId: oidcClientId,
  auth0ClientSecret: oidcClientSecret,
  auth0Issuer: oidcIssuer,
  jwtSecret,
  rpcHost,
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
      if (token.sub && token.accessToken) {
        const trpcProxyServer = createServer(rpcHost, token.accessToken)

        const user = await trpcProxyServer.mutation("user.registerAndGet", token.sub)

        session.user = UserSchema.parse(user)
      }

      return session
    },
  },
})
