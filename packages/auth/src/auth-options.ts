import { type NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: `${process.env.HYDRA_PUBLIC_URL as string}/.well-known/openid-configuration`,
      authorization: { params: { grant_type: "authorization_code", scope: "openid email profile" } },
      profile(profile) {
        return {
          email: profile.sub,
          id: profile.user.id,
          image: profile.user.image,
          name: profile.user.name,
        }
      },
      clientId: process.env.NEXTAUTH_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_CLIENT_SECRET as string,
    },
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? `${baseUrl}/` : baseUrl
    },
    async session({ session, token }) {
      console.log(token)
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}
