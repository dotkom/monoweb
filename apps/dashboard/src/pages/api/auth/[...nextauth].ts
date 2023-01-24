import NextAuth, { DefaultUser, NextAuthOptions } from "next-auth"
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter"
import { Redis } from "@upstash/redis"

// TODO: find a nicer way to do this
process.env.NEXTAUTH_URL = "http://localhost:3002"

export const authOptions: NextAuthOptions = {
  // TODO: use next-auth default jwt adapter
  //  context: it failed because for some reason, user would be undefined in
  //  session callback. investigate later
  adapter: UpstashRedisAdapter(
    new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    }),
    { baseKeyPrefix: "owdashboard:" }
  ),
  // Configure one or more authentication providers
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: `${process.env.HYDRA_PUBLIC_URL as string}/.well-known/openid-configuration`,
      authorization: { params: { grant_type: "authorization_code", scope: "openid email profile" } },
      profile(profile): DefaultUser {
        console.log({ profile })
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
  callbacks: {
    async signIn({ profile }) {
      return !!profile
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? `${baseUrl}/` : baseUrl
    },
    async session({ session, user }) {
      console.log(session, user)
      if (user.id) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
}

export default NextAuth(authOptions)
