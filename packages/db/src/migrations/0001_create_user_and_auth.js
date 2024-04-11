import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  const query = sql`CREATE EXTENSION IF NOT EXISTS ulid;`.compile(db)
  await db.executeQuery(query)
  await db.schema
    .createTable("ow_user")
    .addColumn("auth0_id", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("email", "varchar(255)", (col) => col.unique().notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("profile_picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("study_year", "integer", (col) => col.notNull())
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("on_boarded", "boolean", (col) => col.notNull())
    .addColumn("phone_number", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .addColumn("email_verified", "boolean")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}
