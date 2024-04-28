import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("interest_group")
    .addColumn("isActive", sql`boolean`, (col) => col.notNull().defaultTo(true))
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.alterTable("interest_group").dropColumn("isActive").execute()
}
