import { DefaultSession, DefaultUser, User } from "next-auth"
import { type NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User
    id: string
  }

  interface User extends DefaultUser {
    id: string
    name: string
    email: string
    image?: string
  }
}

export type AuthOptions = {
  cognitoClientId: string
  cognitoClientSecret: string
  cognitoIssuer: string
}

export const getAuthOptions = ({
  cognitoClientId,
  cognitoClientSecret,
  cognitoIssuer,
}: AuthOptions): NextAuthOptions => ({
  providers: [
    CognitoProvider({
      clientId: cognitoClientId,
      clientSecret: cognitoClientSecret,
      issuer: cognitoIssuer,
      profile: (profile): User => {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
