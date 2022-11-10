import { Generated } from "kysely"

import { Timestamp } from "./common"

export interface UserTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  name: string | null
  email: string
  emailVerified: Timestamp | null
  password: string
  image: string | null
}

export interface SessionTable {
  id: Generated<string>
  creadetAt: Generated<Timestamp>
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
  createdAt: Generated<Timestamp>
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

  userID: string
}
