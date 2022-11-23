import { type NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  // adapters: ,
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: `${process.env.HYDRA_ADMIN_URL as string}/.well-known/openid-configuration"`,
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
      clientId: process.env.NEXTAUTH_CLIENT_ID as string,
    },
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
}
