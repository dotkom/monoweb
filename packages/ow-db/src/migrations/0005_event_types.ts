import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.createType("event_type").asEnum(["SOCIAL", "COMPANY"]).execute()
  await db.schema
    .alterTable("committee")
    .modifyColumn("type", sql`event_type`)
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable("committee")
    .modifyColumn("type", sql`varchar(255)`)
    .execute()
  await db.schema.dropTable("event_type").execute()
}
