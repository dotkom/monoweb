import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("event").addColumn("extras", "json").execute()
  await db.schema.alterTable("attendee").addColumn("extras_choices", "json").execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("attendee").dropColumn("extras_choices").execute()
  await db.schema.alterTable("event").dropColumn("extras").execute()
}
