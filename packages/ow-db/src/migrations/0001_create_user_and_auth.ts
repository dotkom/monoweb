import { Kysely, sql } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>): Promise<void> {
  await createTableWithDefaults("ow_user", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("email_verified", "boolean", (col) => col.notNull().defaultTo(sql`false`))
    .addColumn("password", "varchar(255)", (col) => col.notNull())
    .addColumn("image", "varchar(255)")
    .execute()

  // Copy the pgm session table from the old migration and convert it into a Kysely migration
  await createTableWithDefaults("session", { id: true, createdAt: true }, db.schema)
    .addColumn("session_token", "text", (col) => col.notNull().unique())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .addColumn("user_id", "uuid", (col) => col.references("ow_user.id").onDelete("cascade").notNull())
    .execute()

  await createTableWithDefaults("verification_token", { id: true }, db.schema)
    .addColumn("identifier", "varchar(250)", (col) => col.notNull().unique())
    .addColumn("token", "varchar(250)", (col) => col.notNull())
    .addColumn("expires", "timestamp", (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex("identifier_token_unique_index")
    .on("verification_token")
    .columns(["identifier", "token"])
    .unique()
    .execute()

  await createTableWithDefaults("account", { id: true, createdAt: true }, db.schema)
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
    .addColumn("user_id", "uuid", (col) => col.notNull().references("ow_user.id").onDelete("cascade"))
    .execute()

  await db.schema
    .createIndex("provider_account_unique_index")
    .on("account")
    .columns(["provider", "provider_account_id"])
    .unique()
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("provider_account_unique_index").execute()
  await db.schema.dropIndex("identifier_token_unique_index").execute()
  await db.schema.dropTable("account").execute()
  await db.schema.dropTable("verification_token").execute()
  await db.schema.dropTable("session").execute()
  await db.schema.dropTable("ow_user").execute()
}
