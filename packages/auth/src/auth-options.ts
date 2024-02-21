import { type ServiceLayer, NotFoundError } from "@dotkomonline/core"
import { type DefaultSession, type DefaultUser, type User, type NextAuthOptions } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

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
  }
}

export interface AuthOptions {
  cognitoClientId: string
  cognitoClientSecret: string
  cognitoIssuer: string
  core: ServiceLayer
  jwtSecret: string
}

export const getAuthOptions = ({
  cognitoClientId,
  cognitoClientSecret,
  cognitoIssuer,
  core,
  jwtSecret,
}: AuthOptions): NextAuthOptions => ({
  secret: jwtSecret,
  providers: [
    CognitoProvider({
      clientId: cognitoClientId,
      clientSecret: cognitoClientSecret,
      issuer: cognitoIssuer,
      profile: (profile): User => ({
        id: profile.sub,
        name: `${profile.given_name} ${profile.family_name}`,
        email: profile.email,
        image: profile.picture ?? undefined,
      }),
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        const user = await core.userService.getUserBySubject(token.sub)
        if (user === undefined) {
          throw new NotFoundError(`Found no matching user for ${token.sub}`)
        }
        session.user.id = user.id
        session.sub = token.sub
      }
      return session
    },
  },
})
