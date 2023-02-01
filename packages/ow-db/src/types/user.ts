import { Generated } from "kysely"

export interface UserTable {
  id: Generated<string>
  createdAt: Generated<Date>
  name: string | null
  email: string
  emailVerified: Date | null
  password: string
  image: string | null
}

export interface SessionTable {
  id: Generated<string>
  createdAt: Generated<Date>
  sessionToken: string
  expires: Date
  userId: string
}

export interface VerificationTokenTable {
  identifier: string
  token: string
  expires: Date
}

export interface AccountTable {
  id: Generated<string>
  createdAt: Generated<Date>
  type: string
  provider: string
  providerAccountId: string
  refreshToken: string | null
  accessToken: string | null
  expiresAt: number | null
  tokenType: string | null
  scope: string | null
  idToken: string | null
  sessionState: string | null
  oauthTokenSecret: string | null
  oauthToken: string | null

  userId: string
}
