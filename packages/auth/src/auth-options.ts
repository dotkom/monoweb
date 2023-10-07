import { type DefaultSession, type DefaultUser, type User } from "next-auth";
import { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

declare module "next-auth" {
  interface Session extends DefaultSession {
    id: string;
    user: User;
  }

  interface User extends DefaultUser {
    email: string;
    id: string;
    image?: string;
    name: string;
  }
}

export interface AuthOptions {
  cognitoClientId: string;
  cognitoClientSecret: string;
  cognitoIssuer: string;
}

export const getAuthOptions = ({
  cognitoClientId,
  cognitoClientSecret,
  cognitoIssuer,
}: AuthOptions): NextAuthOptions => ({
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  providers: [
    CognitoProvider({
      clientId: cognitoClientId,
      clientSecret: cognitoClientSecret,
      issuer: cognitoIssuer,
      profile: (profile): User => {
        const middleName = profile.middle_name !== undefined ? `${profile.middle_name} ` : "";
        const name = `${profile.given_name} ${middleName} ${profile.family_name}`;

        return {
          email: profile.email,
          id: profile.sub,
          image: profile.picture ?? undefined,
          name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
