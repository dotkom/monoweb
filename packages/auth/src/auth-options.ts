import { DefaultSession } from "next-auth"
import { type NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"]
  }
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
      /* eslint-disable */
      profile(profile: any) {
        return {
          email: profile.user.emailAddresses[0].emailAddress,
          id: profile.user.id,
          image: profile.user.profileImageUrl,
          name: profile.user.username,
        }
      },
      /* eslint-enable */
      clientId: process.env.NEXTAUTH_DASHBOARD_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_DASHBOARD_CLIENT_SECRET as string,
    },
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
