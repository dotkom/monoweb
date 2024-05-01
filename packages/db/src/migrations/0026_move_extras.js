/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("event").dropColumn("extras").execute()

  await db.schema.alterTable("attendance").addColumn("extras", "json").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("attendance").dropColumn("extras").execute()

  await db.schema.alterTable("event").addColumn("extras", "json").execute()
}
