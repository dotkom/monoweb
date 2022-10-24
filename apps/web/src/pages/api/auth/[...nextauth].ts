import NextAuth, { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: "http://127.0.0.1:4444/.well-known/openid-configuration",
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
      clientId: "my-client",
    },
  ],
}

export default NextAuth(authOptions)
