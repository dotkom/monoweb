import { Generated, Kysely, sql } from "kysely"

interface CompanyTable {
  id: Generated<string>
  name: string
  description: string
  phone: string | undefined
  email: string
  website: string
  location: string | null
  type: string | null
}

interface UserTable {
  id: Generated<string>
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  createdAt: Generated<Date>
  password: string
}

interface SessionTable {
  id: Generated<string>
  sessionToken: string
  userId: string
  expires: Date
}

interface VerificationTokenTable {
  identifier: string
  token: string
  expires: Date
}

interface AccountTable {
  id: Generated<string>
  userId: string
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
}

interface Database {
  company: CompanyTable
  user: UserTable
  session: SessionTable
  verificationToken: VerificationTokenTable
  account: AccountTable
}

const uuid = sql`gen_random_uuid()`

export const up = async (db: Kysely<Database>) => {
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("name", "varchar(100)")
    .addColumn("email", "varchar(100)")
    .addColumn("email_verified", "timestamp")
    .addColumn("image", "varchar(250)")
    .addColumn("password", "varchar(250)", (col) => col.notNull())

  await db.schema
    .createTable("company")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("phone", "varchar(50)")
    .addColumn("email", "varchar(80)", (col) => col.notNull().unique())
    .addColumn("website", "varchar(100)", (col) => col.notNull())
    .addColumn("location", "varchar(100)")
    .addColumn("type", "varchar(100)")

  await db.schema
    .createTable("session")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("session_token", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("user_id", "uuid", (col) => col.references("user.id").onDelete("cascade").notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())

  await db.schema
    .createTable("verification_token")
    .addColumn("identifier", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("token", "varchar(100)", (col) => col.notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("verification_token_identifier_token_unique", ["identifier", "token"])

  await db.schema
    .createTable("account")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(uuid))
    .addColumn("user_id", "uuid", (col) => col.references("user.id").onDelete("cascade").notNull())
    .addColumn("type", "varchar(100)", (col) => col.notNull())
    .addColumn("provider", "varchar(100)", (col) => col.notNull())
    .addColumn("provider_account_id", "varchar(100)", (col) => col.notNull())
    .addColumn("refresh_token", "varchar(100)")
    .addColumn("access_token", "varchar(100)")
    .addColumn("expires_at", "bigint")
    .addColumn("token_type", "varchar(100)")
    .addColumn("scope", "varchar(100)")
    .addColumn("id_token", "varchar(100)")
    .addColumn("session_state", "varchar(100)")
    .addUniqueConstraint("account_provider_provider_account_id_unique", ["provider", "provider_account_id"])
}
