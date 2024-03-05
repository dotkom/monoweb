import { type ServiceLayer } from "@dotkomonline/core"
import { type DefaultSession, type DefaultUser, type User, type NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import { createNewUser, syncUserWithAuth0 as handleUserSyncLocal } from "./utils"

function splitName(name: string) {
  const [firstName, ...lastName] = name.split(" ")
  return {
    firstName,
    lastName: lastName.join(" "),
  }
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
      console.log("CALLBACK")
      if (token.sub) {
        const user = await core.userService.getUserBySubject(token.sub)

        if (user === undefined) {
          const newUser = await createNewUser(core, token)

          session.user.id = newUser.id
          session.sub = token.sub
          return session
        }

        handleUserSyncLocal(core, user)

        session.user.id = user.id
        session.sub = token.sub
      }
      return session
    },
   },
})
