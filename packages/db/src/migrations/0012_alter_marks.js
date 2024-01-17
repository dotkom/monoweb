/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("mark").renameColumn("given_at", "created_at").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("mark").renameColumn("created_at", "given_at").execute()
}
