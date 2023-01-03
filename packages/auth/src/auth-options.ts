import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter"
import { Redis } from "@upstash/redis"
import { type NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: UpstashRedisAdapter(
    new Redis({
      url: process.env.UPSTASH_REDIS_URL as string,
      token: process.env.UPSTASH_REDIS_TOKEN as string,
    }),
    { baseKeyPrefix: "ow:" }
  ),
  providers: [
    {
      id: "onlineweb",
      name: "Onlineweb",
      type: "oauth",
      wellKnown: `${process.env.HYDRA_PUBLIC_URL as string}/.well-known/openid-configuration`,
      authorization: { params: { grant_type: "authorization_code", scope: "openid email profile" } },
      profile(profile) {
        console.log({ profile })
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
    async signIn({ profile }) {
      return !!profile
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? `${baseUrl}/` : baseUrl
    },
    async session({ session, user }) {
      if (session.user.id && user.id) {
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
