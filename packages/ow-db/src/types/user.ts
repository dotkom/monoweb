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
  userID: string
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
  providerAccountID: string
  refreshToken: string | null
  accessToken: string | null
  expiresAt: number | null
  tokenType: string | null
  scope: string | null
  idToken: string | null
  sessionState: string | null
  oauthTokenSecret: string | null
  oauthToken: string | null

  userID: string
}
