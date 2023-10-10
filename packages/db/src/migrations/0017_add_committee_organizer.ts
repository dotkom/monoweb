import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("event").dropColumn("committee_id").execute()

  await db.schema
    .createTable("committee_organizer")
    .addColumn("committee_id", "uuid", (col) => col.references("committee.id").onDelete("cascade"))
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("committee_organizer_pk", ["committee_id", "event_id"])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable("event")
    .addColumn("committee_id", "uuid", (col) => col.references("committee.id").onDelete("cascade"))
    .execute()

  await db.schema.dropTable("committee_organizer").execute()
}
