import { Generated } from "kysely"
import { Timestamp } from "./common"

export interface UserTable {
  id: Generated<string>
  name: string | null
  email: string | null
  emailVerified: Timestamp| null
  image: string | null
  createdAt: Generated<Timestamp>
  password: string
}

export interface SessionTable {
  id: Generated<string>
  sessionToken: string
  userID: string
  expires: Date
}

export interface VerificationTokenTable {
  identifier: string
  token: string
  expires: Date
}

export interface AccountTable {
  id: Generated<string>
  userID: string
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
}