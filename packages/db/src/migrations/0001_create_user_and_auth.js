import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  // await createTableWithDefaults("ow_user", { id: true, createdAt: true }, db.schema).execute()

  await db.schema
    .createTable("ow_user")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))

    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("family_name", "varchar(255)")
    .addColumn("given_name", "varchar(255)")
    .addColumn("profile_picture", "varchar(255)")
    .addColumn("role", "varchar(255)")
    .addColumn("allergies", "json")
    .addColumn("study_year", "integer", (col) => col.notNull())
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}
