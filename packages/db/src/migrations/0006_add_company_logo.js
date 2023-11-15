/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("company").addColumn("image", "text").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("company").dropColumn("image").execute()
}
