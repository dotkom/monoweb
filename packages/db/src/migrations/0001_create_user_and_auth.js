import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  await createTableWithDefaults("ow_user", { id: true, createdAt: true, updatedAt: true }, db.schema)
  .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
  .addColumn("first_name", "varchar(255)", (col) => col.notNull())
  .addColumn("last_name", "varchar(255)", (col) => col.notNull())
  .addColumn("name", "varchar(255)", (col) => col.notNull())
  .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
  .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}