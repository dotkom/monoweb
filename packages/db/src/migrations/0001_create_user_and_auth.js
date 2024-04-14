import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  await createTableWithDefaults("ow_user", { id: true, createdAt: true }, db.schema).execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}
