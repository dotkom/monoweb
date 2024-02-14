/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.alterTable("ow_user").dropColumn("study_year").execute()
}
