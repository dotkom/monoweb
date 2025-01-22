/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("job_listing")
    .alterColumn("ingress", sql`text`, (col) => col.notNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("job_listing")
    .alterColumn("ingress", sql`character varying(250)`, (col) => col.notNull())
    .execute()
}
