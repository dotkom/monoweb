import { type User, UserSchema } from "@dotkomonline/types"
import { createRemoteJWKSet, jwtVerify } from "jose"
import type { DefaultSession, NextAuthConfig } from "next-auth"
import type { DefaultJWT, JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"
import { createServer } from "./trpc"

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

export const createAuthConfig = ({
  auth0ClientId,
  auth0ClientSecret,
  auth0Issuer,
  jwtSecret,
  rpcHost,
}: AuthOptions): NextAuthConfig => {
  const issuerWithoutTrailingSlash = auth0Issuer.replace(/\/$/, "")
  const jwksUrl = new URL("/.well-known/jwks.json", issuerWithoutTrailingSlash)
  const jwks = createRemoteJWKSet(jwksUrl, {
    // Auth0 gives a max-age=15 and stale-while-revalidate=15 header. We will cache the JWKS for 30 seconds at a time.
    cacheMaxAge: 30000,
  })

  return {
    secret: jwtSecret,
    providers: [
      Auth0Provider({
        clientId: auth0ClientId,
        clientSecret: auth0ClientSecret,
        issuer: auth0Issuer,
        profile: (profile) => ({
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
        if (token.accessToken === undefined) {
          return session
        }
        const trpcProxyServer = createServer(rpcHost, token.accessToken)
        try {
          const jwt = await jwtVerify(token.accessToken, jwks, {
            clockTolerance: "5s",
            algorithms: ["RS256"],
            // Auth0's issuer contains a trailing slash, but Next Auth does not
            issuer: `${auth0Issuer}/`,
            // audience: this.audiences,
            typ: "JWT",
          })
          const user = await trpcProxyServer.mutation("user.registerAndGet", jwt.payload.sub)
          session.user = {
            ...UserSchema.parse(user),
            emailVerified: null,
          }
        } catch (err) {
          // TODO: replace with logger
          console.error("failed to verify access token", err)
        }
        return session
      },
    },
  }
}
