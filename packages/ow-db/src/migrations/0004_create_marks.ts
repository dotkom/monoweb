import { Kysely } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await createTableWithDefaults("mark", { id: true, createdAt: false, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("given_at", "timestamptz", (col) => col.notNull())
    .addColumn("category", "varchar(255)", (col) => col.notNull())
    .addColumn("details", "text")
    .addColumn("duration", "integer", (col) => col.notNull())
    .execute()

  await db.schema
    .createTable("personalMark")
    .addColumn("markId", "uuid", (col) => col.references("Mark.id").onDelete("cascade"))
    .addColumn("userId", "uuid", (col) => col.references("User.id").onDelete("cascade"))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("PersonalMark").execute()
  await db.schema.dropTable("Mark").execute()
}
