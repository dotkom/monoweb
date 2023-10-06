import { type DefaultSession, type DefaultUser, type User } from "next-auth";
import { type NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
    id: string;
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    image?: string;
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
  providers: [
    CognitoProvider({
      clientId: cognitoClientId,
      clientSecret: cognitoClientSecret,
      issuer: cognitoIssuer,
      profile: (profile): User => {
        const middleName = profile.middle_name !== undefined ? `${profile.middle_name} ` : "";
        const name = `${profile.given_name} ${middleName} ${profile.family_name}`;

        return {
          id: profile.sub,
          name,
          email: profile.email,
          image: profile.picture ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
