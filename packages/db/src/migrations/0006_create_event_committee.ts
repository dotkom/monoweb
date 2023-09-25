import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("event_committee")
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("committee_id", sql`ulid`, (col) => col.references("committee.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_committee_pk", ["event_id", "committee_id"])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("event_committee").execute()
}
