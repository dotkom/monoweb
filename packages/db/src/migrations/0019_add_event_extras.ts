import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("event").addColumn("extras_choice", "json").execute()
  await db.schema.alterTable("attendee").addColumn("extras_choice", "json").execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("attendee").dropColumn("extras_choice").execute()
  await db.schema.alterTable("event").dropColumn("extras_choice").execute()
}
