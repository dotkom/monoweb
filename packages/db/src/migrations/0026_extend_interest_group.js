import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("interest_group")
    .addColumn("image", sql`text`)
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.alterTable("interest_group").dropColumn("image").execute()
}
