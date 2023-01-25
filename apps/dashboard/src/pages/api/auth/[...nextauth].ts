import NextAuth, { DefaultUser, NextAuthOptions } from "next-auth"

if (process.env.NODE_ENV === "development") {
  process.env.NEXTAUTH_URL = "http://localhost:3002"
}

export const authOptions: NextAuthOptions = {
  // TODO: use next-auth default jwt adapter
  //  context: it failed because for some reason, user would be undefined in
  //  session callback. investigate later
  // Configure one or more authentication providers
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: `${process.env.HYDRA_PUBLIC_URL as string}/.well-known/openid-configuration`,
      authorization: { params: { grant_type: "authorization_code", scope: "openid email profile" } },
      profile(profile): DefaultUser {
        return {
          email: profile.sub,
          id: profile.user.id,
          image: profile.user.image,
          name: profile.user.name,
        }
      },
      clientId: process.env.NEXTAUTH_DASHBOARD_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_DASHBOARD_CLIENT_SECRET as string,
    },
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, user: _, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
