import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("attendee")
    .addColumn("attended", "boolean", (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("attendee").dropColumn("attended").execute()
}