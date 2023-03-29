import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("attendee")
    .addColumn("attended", "boolean", (col) => col.notNull())
    .execute()
}
