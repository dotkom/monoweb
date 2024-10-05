/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("ow_user").dropColumn("middleName").dropColumn("lastSyncedAt").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("middleName", "text")
    .addColumn("lastSyncedAt", "timestamptz")
    .execute()
}
