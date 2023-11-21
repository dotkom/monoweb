/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("attendee")
    .addColumn("attended", "boolean", (col) => col.notNull().defaultTo(false))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("attendee").dropColumn("attended").execute()
}
