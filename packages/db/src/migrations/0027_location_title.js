/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("event")
    .dropColumn("location")
    .addColumn("location_title", "varchar(255)", { nullable: false })
    .addColumn("location_address", "varchar(255)")
    .addColumn("location_link", "text")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  // await db.schema.alterTable("event").dropColumn("location_title").execute()
  await db.schema
    .alterTable("event")
    .dropColumn("location_address")
    .dropColumn("location_title")
    .dropColumn("location_link")
    .addColumn("location", "varchar(255)")
    .execute()
}
