import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.createType("event_type").asEnum(["SOCIAL", "ACADEMIC", "COMPANY", "BEDPRES"]).execute()
  await db.schema
    .alterTable("committee")
    .addColumn("type", sql`event_type`)
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("committee").dropColumn("type").execute()
  await db.schema.dropType("event_type").ifExists().execute()
}
