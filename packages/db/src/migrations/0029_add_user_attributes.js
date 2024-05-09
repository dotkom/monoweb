/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("auth0_sub") // rename to auth0_id
    .addColumn("auth0_id", "varchar(128)", (col) => col.unique().notNull()) //https://community.auth0.com/t/is-256-a-safe-max-length-for-a-user-id/34040/9
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("middle_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("ow_user").execute()
}
