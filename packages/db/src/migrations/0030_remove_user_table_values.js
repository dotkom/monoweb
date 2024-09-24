import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("name")
    .dropColumn("picture")
    .dropColumn("allergies")
    .dropColumn("phone")
    .dropColumn("gender")
    .dropColumn("created_at")
    .dropColumn("updated_at")
    .dropColumn("last_synced_at")
    .dropColumn("study_year")
    .dropColumn("family_name")
    .dropColumn("middle_name")
    .dropColumn("given_name")
    .dropColumn("email")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("middle_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
    .execute()
}
