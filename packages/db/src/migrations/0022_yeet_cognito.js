import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("cognito_sub")
    .addColumn("auth0_sub", sql`character varying(50)`, (col) => col.unique().notNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("auth0_sub")
    .addColumn("cognito_sub", sql`uuid`, (col) => col.unique().unique())
    .execute()
}
