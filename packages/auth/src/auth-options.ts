import type { ServiceLayer } from "@dotkomonline/core"
import type { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

const CUSTOM_CLAIM_PREFIX = "https://online.ntnu.no"
type CustomIdTokenClaims = {
  studyYear: number
  owUserId: string
}

// https://www.iana.org/assignments/jwt/jwt.xhtml
type StandardClaims = {
  iss: string
  aud: string
  iat: number
  exp: number
  sub: string
  sid: string

  name: string
  given_name: string
  middle_name: string
  family_name: string
  nickname: string
  picture: string
  email: string
  email_verified: boolean
}

declare module "next-auth" {
  interface Session {
    user: CustomIdTokenClaims & StandardClaims
    sub: string
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
      profile: (profile) => ({
        id: profile.sub, // Next auth throws an error if this is not set. User interface exposes id thorugh session.user.sub, and owUserId through session.user.owlUserId

        given_name: profile.given_name,
        family_name: profile.family_name,
        nickname: profile.nickname,
        name: profile.name,
        picture: profile.picture,
        updated_at: profile.updated_at,
        email: profile.email,
        email_verified: profile.email_verified,

        iss: profile.iss,
        aud: profile.aud,
        iat: profile.iat,
        exp: profile.exp,
        sub: profile.sub,
        sid: profile.sid,

        middle_name: profile[`${CUSTOM_CLAIM_PREFIX}/middle_name`],
        allergies: profile[`${CUSTOM_CLAIM_PREFIX}/allergies`],
        phone: profile[`${CUSTOM_CLAIM_PREFIX}/phone`],
        gender: profile[`${CUSTOM_CLAIM_PREFIX}/gender`],
        studyYear: profile[`${CUSTOM_CLAIM_PREFIX}/study_year`],
        owUserId: profile[`${CUSTOM_CLAIM_PREFIX}/ow_user_id`],
      }),
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }

      return token
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        }
      }

      if (token.sub) {
        await core.userService.handlePopulateUserWithFakeData(token.sub, token.email) // Remove when we have real data
        await core.auth0SynchronizationService.handleUserSync(token.sub, new Date())
        session.sub = token.sub
      }

      return session
    },
  },
})
