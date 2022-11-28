import { Kysely, sql } from "kysely"

import { createTableWithDefaults } from "../utils"

// Kysely reccomends using "any" in migrations

export async function up(db: Kysely<any>): Promise<void> {
  await createTableWithDefaults("User", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("email_verified", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("password", "varchar(255)", (col) => col.notNull())
    .addColumn("image", "varchar(255)")
    .execute()

  await createTableWithDefaults("Session", { id: true, createdAt: true }, db.schema)
    .addColumn("session_token", "text", (col) => col.notNull().unique())
    .addColumn("expires", "timestamptz", (col) => col.notNull())
    .addColumn("user_id", "uuid", (col) => col.references("User.id").onDelete("cascade").notNull())
    .execute()

  await createTableWithDefaults("VerificationToken", { id: true }, db.schema)
    .addColumn("identifier", "varchar(250)", (col) => col.notNull().unique())
    .addColumn("token", "varchar(250)", (col) => col.notNull())
    .addColumn("expires", "timestamptz", (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex("VerificationToken_identifier_token_unique_index")
    .on("VerificationToken")
    .columns(["identifier", "token"])
    .unique()
    .execute()

  await createTableWithDefaults("Account", { id: true, createdAt: true }, db.schema)
    .addColumn("type", "varchar(100)", (col) => col.notNull())
    .addColumn("provider", "varchar(100)", (col) => col.notNull())
    .addColumn("provider_account_id", "varchar(100)", (col) => col.notNull())
    .addColumn("refresh_token", "text")
    .addColumn("access_token", "text")
    .addColumn("expires_at", "bigint")
    .addColumn("token_type", "varchar(100)")
    .addColumn("scope", "varchar(100)")
    .addColumn("id_token", "text")
    .addColumn("session_state", "varchar(100)")
    .addColumn("oauth_token_secret", "text")
    .addColumn("oauth_token", "text")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .execute()

  await db.schema
    .createIndex("Account_provider_account_unique_index")
    .on("Account")
    .columns(["provider", "provider_account_id"])
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Account").execute()
  await db.schema.dropTable("VerificationToken").execute()
  await db.schema.dropTable("Session").execute()
  await db.schema.dropTable("User").execute()
}
