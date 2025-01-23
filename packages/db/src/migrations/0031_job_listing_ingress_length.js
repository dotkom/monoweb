import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("job_listing")
    .alterColumn(
      "ingress",
      (col) => col.setDataType("text"),
      (col) => col.notNull()
    )
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("job_listing")
    .alterColumn(
      "ingress",
      (col) => col.setDataType(sql`character varying(250)`),
      (col) => col.notNull()
    )
    .execute()
}
