import { Kysely } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await createTableWithDefaults("Mark", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("givenAt", "timestamptz", (col) => col.notNull())
    .addColumn("category", "varchar(255)", (col) => col.notNull())
    .addColumn("latestChange", "timestamptz", (col) => col.notNull())
    .addColumn("details", "text")
    .addColumn("givenTo", "varchar(255)")
    .addColumn("duration", "integer", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("PersonalMark", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("markId", "uuid", (col) => col.references("Mark.id").onDelete("cascade"))
    .addColumn("userId", "uuid", (col) => col.references("User.id").onDelete("cascade"))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("PersonalMark").execute()
  await db.schema.dropTable("Mark").execute()
}
