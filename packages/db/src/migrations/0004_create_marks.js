import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("mark", { id: true, createdAt: false, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("given_at", "timestamptz", (col) => col.notNull())
    .addColumn("category", "varchar(255)", (col) => col.notNull())
    .addColumn("details", "text")
    .addColumn("duration", "integer", (col) => col.notNull())
    .execute()

  await db.schema
    .createTable("personal_mark")
    .addColumn("mark_id", sql`ulid`, (col) => col.references("mark.id").onDelete("cascade"))
    .addColumn("user_id", sql`ulid`, (col) => col.references("owUser.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("personal_mark_pk", ["mark_id", "user_id"])
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("personal_mark").execute()
  await db.schema.dropTable("mark").execute()
}
