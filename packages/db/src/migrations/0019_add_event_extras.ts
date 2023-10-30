import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("event").addColumn("attendee_questions", "json").execute()
  await db.schema.alterTable("attendee").addColumn("event_questions_responses", "json").execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("attendee").dropColumn("event_questions_responses").execute()
  await db.schema.alterTable("event").dropColumn("attendee_questions").execute()
}
