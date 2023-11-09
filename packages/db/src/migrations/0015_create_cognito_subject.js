/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("cognito_sub", "uuid", (col) => col.notNull().unique())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("ow_user").dropColumn("cognito_sub").execute()
}
