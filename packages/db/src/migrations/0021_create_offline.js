import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("offline", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", sql`text`, (col) => col.notNull())
    .addColumn("published", sql`timestamptz`, (col) => col.notNull())
    .addColumn("file_url", sql`text`)
    .addColumn("image_url", sql`text`)
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("offline").execute()
}
