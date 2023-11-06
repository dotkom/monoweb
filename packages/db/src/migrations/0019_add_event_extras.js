/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("event").addColumn("extras", "json").execute()
  await db.schema.alterTable("attendee").addColumn("extras_choices", "json").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("attendee").dropColumn("extras_choices").execute()
  await db.schema.alterTable("event").dropColumn("extras").execute()
}
