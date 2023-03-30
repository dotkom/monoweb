import { authOptions as defaultAuthOptions } from "@dotkomonline/auth"
import { NextAuthOptions } from "next-auth"
import { OAuthConfig } from "next-auth/providers"

export const authOptions: NextAuthOptions = {
  ...defaultAuthOptions,
  providers: [
    {
      ...(defaultAuthOptions.providers[0] as OAuthConfig<unknown>),
      clientId: process.env.NEXTAUTH_DASHBOARD_CLIENT_ID as string,
      clientSecret: process.env.NEXTAUTH_DASHBOARD_CLIENT_SECRET as string,
    } satisfies OAuthConfig<unknown>,
  ],
}
