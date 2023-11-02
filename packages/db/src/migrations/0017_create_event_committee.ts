import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable("event_committee")
    .addColumn("committee_id", sql`ulid`, (col) => col.references("committee.id").onDelete("cascade"))
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_committee_pk", ["committee_id", "event_id"])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("event_committee").execute()
}
