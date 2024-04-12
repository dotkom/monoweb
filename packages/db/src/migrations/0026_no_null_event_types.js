import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("event")
    .alterColumn("type", (col) => col.setNotNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("event")
    .alterColumn("type", (col) => col.dropNotNull())
    .execute()
}
