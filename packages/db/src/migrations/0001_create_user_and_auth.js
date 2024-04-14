import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  await createTableWithDefaults("ow_user", { id: true }, db.schema)
    .addColumn("auth0_id", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("email", "varchar(255)", (col) => col.unique().notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("study_year", "integer", (col) => col.notNull())
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}
