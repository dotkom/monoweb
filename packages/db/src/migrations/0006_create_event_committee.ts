import { type Kysely } from "kysely";

export async function up(db: Kysely<any>) {
    await db.schema
        .createTable("event_committee")
        .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade"))
        .addColumn("committee_id", "uuid", (col) => col.references("committee.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("event_committee_pk", ["event_id", "committee_id"])
        .execute();
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("event_committee").execute();
}
