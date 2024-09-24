/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("middle_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .execute()

  await db.schema.alterTable("ow_user").renameColumn("auth0_sub", "auth0_id").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("family_name")
    .dropColumn("middle_name")
    .dropColumn("given_name")
    .dropColumn("picture")
    .dropColumn("allergies")
    .dropColumn("phone")
    .dropColumn("gender")
    .execute()

  await db.schema.alterTable("ow_user").renameColumn("auth0_id", "auth0_sub").execute()
}
