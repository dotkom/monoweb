import { Kysely, sql } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await createTableWithDefaults("mark", { id: true, createdAt: false, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("given_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("category", "varchar(255)", (col) => col.notNull())
    .addColumn("details", "text")
    .addColumn("duration", "integer", (col) => col.notNull())
    .execute()

  await db.schema
    .createTable("personal_mark")
    .addColumn("mark_id", "uuid", (col) => col.references("mark.id").onDelete("cascade"))
    .addColumn("user_id", "uuid", (col) => col.references("ow_user.id").onDelete("cascade"))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("personal_mark").execute()
  await db.schema.dropTable("mark").execute()
}
