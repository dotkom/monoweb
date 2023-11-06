/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("committee")
    .addColumn("description", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("email", "text", (col) => col.notNull().defaultTo("kontakt@online.ntnu.no"))
    .addColumn("image", "text")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("committee").dropColumn("description").dropColumn("email").dropColumn("image").execute()
}
