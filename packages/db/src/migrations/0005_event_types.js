import { sql } from "kysely";

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .createType("event_type")
    .asEnum(["SOCIAL", "ACADEMIC", "COMPANY", "BEDPRES"])
    .execute();
  await db.schema
    .alterTable("event")
    .addColumn("type", sql`event_type`)
    .execute();
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("event").dropColumn("type").execute();
  await db.schema.dropType("event_type").ifExists().execute();
}
