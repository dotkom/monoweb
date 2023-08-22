import {DefaultSession, DefaultUser, User} from "next-auth"
import { type NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito";

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

export const authOptions: NextAuthOptions = {
  providers: [
      CognitoProvider({
        clientId: process.env.DASHBOARD_COGNITO_CLIENT_ID as string,
        clientSecret: process.env.DASHBOARD_COGNITO_CLIENT_SECRET as string,
        issuer: process.env.DASHBOARD_COGNITO_ISSUER as string,
        profile: (profile): User => {
          const middleName = profile.middle_name !== undefined
            ? profile.middle_name + ' '
              : ''
          const name = `${profile.given_name} ${middleName} ${profile.family_name}`
          return {
            id: profile.sub,
            name,
            email: profile.email,
            image: profile.picture ?? undefined
          }
        }
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
}
