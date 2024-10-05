import { type UserRepository, UserRepositoryImpl } from "@dotkomonline/core"
import { createKysely } from "@dotkomonline/db"
import type { UserWrite } from "@dotkomonline/types"
import type { DefaultSession, DefaultUser, NextAuthOptions, User } from "next-auth"
import type { DefaultJWT, JWT } from "next-auth/jwt"
import Auth0Provider from "next-auth/providers/auth0"

interface Auth0IdTokenClaims {
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  gender: string
  updated_at: string
  email: string
  email_verified: boolean
  iss: string
  aud: string
  iat: number
  exp: number
  sub: string
  sid: string
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User
    sub: string
    id: string
  }

  interface User extends DefaultUser {
    id: string
    name: string
    email: string
    image?: string
    givenName?: string
    familyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, Record<string, unknown> {
    accessToken?: string
    refreshToken?: string
  }
}

export interface AuthUserService {
  getByAuth0Id(auth0Id: string): Promise<User | null>
  create(data: UserWrite): Promise<User>
}

export class AuthUserServiceImpl implements AuthUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getByAuth0Id(auth0Id: string) {
    try {
      return await this.userRepository.getByAuth0Id(auth0Id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async create(data: UserWrite) {
    return await this.userRepository.create(data)
  }
}

export type AuthUserServiceLayer = Awaited<ReturnType<typeof createAuthServiceLayer>>

export function createAuthServiceLayer(databaseUrl: string) {
  const kysely = createKysely(databaseUrl)
  const userRepository = new UserRepositoryImpl(kysely)
  const authUserService = new AuthUserServiceImpl(userRepository)

  return {
    authUserService,
  }
}

export interface AuthOptions {
  auth0ClientId: string
  auth0ClientSecret: string
  auth0Issuer: string
  authServiceLayer: AuthUserServiceLayer
  jwtSecret: string
}

export const getAuthOptions = ({
  auth0ClientId: oidcClientId,
  auth0ClientSecret: oidcClientSecret,
  auth0Issuer: oidcIssuer,
  authServiceLayer,
  jwtSecret,
}: AuthOptions): NextAuthOptions => ({
  secret: jwtSecret,
  providers: [
    Auth0Provider({
      clientId: oidcClientId,
      clientSecret: oidcClientSecret,
      issuer: oidcIssuer,
      profile: (profile: Auth0IdTokenClaims): User => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture ?? undefined,
        // givenName: profile.given_name,
        // familyName: profile.family_name,
      }),
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        let user = await authServiceLayer.authUserService.getByAuth0Id(token.sub)
        if (!user) {
          user = await authServiceLayer.authUserService.create({
            // TODO: Replace all of these values with https://github.com/dotkom/monoweb/pull/1023
            auth0Id: token.sub,
            email: token.email ?? "fakeemail@example.com",
            givenName: "firstName",
            familyName: "lastName",
            middleName: "middleName",
            name: "firstName middleName lastName",
            allergies: ["allergy1", "allergy2"],
            picture: "https://example.com/image.jpg",
            studyYear: -1,
            lastSyncedAt: new Date(),
            phone: "12345678",
            gender: "male",
          })
        }

        session.user.id = user.auth0Id
        session.sub = token.sub
        return session
      }

      return session
    },
  },
})
