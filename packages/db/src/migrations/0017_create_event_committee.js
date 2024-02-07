import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .createTable("event_committee")
    .addColumn("committee_id", sql`ulid`, (col) => col.references("committee.id").onDelete("cascade"))
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_committee_pk", ["committee_id", "event_id"])
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("event_committee").execute()
}
