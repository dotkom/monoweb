import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("cognitoSub")
    .addColumn("auth0Sub", sql`character varying(50)`, (col) => col.unique())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("auth0Sub")
    .addColumn("cognitoSub", sql`uuid`, (col) => col.unique())
    .execute()
}
