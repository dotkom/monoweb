import type { ServiceLayer } from "@dotkomonline/core"
import { UserSchema } from "@dotkomonline/types"
import type { DefaultSession, NextAuthOptions, User } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import type { z } from "zod"

const IdTokenClaimsSchema = UserSchema.pick({
  givenName: true,
  familyName: true,
  name: true,
  allergies: true,
  email: true,
  gender: true,
  onBoarded: true,
  studyYear: true,
  profilePicture: true,
  emailVerified: true,
  phoneNumber: true,
  id: true,
})

type IdToken = z.infer<typeof IdTokenClaimsSchema>

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: IdToken
    sub: string
    id: string
  }

  interface User extends IdToken {
    email: string // Without specifying a random new field, the User type is not augmented. Why? :(
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
      profile: (profile): User => {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          givenName: profile.givenName,
          familyName: profile.familyName,
          emailVerified: profile.emailVerified,
          phoneNumber: profile.phoneNumber,
          allergies: profile.allergies,
          gender: profile.gender,
          onBoarded: profile.onBoarded,
          studyYear: profile.studyYear,
          profilePicture: profile.profilePicture,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const parsed = IdTokenClaimsSchema.safeParse(user)
        if (!parsed.success) {
          console.log("Failed to parse user in jwt callback", parsed.error)
          return token
        }

        token.user = parsed.data
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
        const user = await core.auth0SynchronizationService.handleUserSync(token.sub)

        session.user.id = user.id
        session.sub = token.sub
      }
      return session
    },
  },
})
