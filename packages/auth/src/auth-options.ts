import { type ServiceLayer } from "@dotkomonline/core"
import { type DefaultSession, type DefaultUser, type User, type NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import { DefaultJWT, JWT } from "next-auth/jwt"

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
  interface JWT extends Record<string, unknown>, DefaultJWT {
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
      authorization: {
        params: {
          // Offline access is required in order to get a refresh token
          scope: "openid email profile offline_access",
        },
      },
      profile: (profile: Auth0IdTokenClaims): User => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture ?? undefined,
          // givenName: profile.given_name,
          // familyName: profile.family_name,
        }
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
        const user = await core.userService.getUserBySubject(token.sub)

        if (user === undefined) {
          const newUser = await core.auth0SynchronizationService.createUser(token)

          session.user.id = newUser.id
          session.sub = token.sub
          return session
        }

        await core.auth0SynchronizationService.synchronizeUser(user)

        session.user.id = user.id
        session.sub = token.sub
      }
      return session
    },
  },
})
