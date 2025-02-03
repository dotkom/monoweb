import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.createType("funnyness").asEnum(["not", "a", "joke"]).execute()

  await db.schema.alterTable("ow_user").addColumn("funnyness", sql`funnyness`).execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {}
