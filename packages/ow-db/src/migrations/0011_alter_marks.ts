import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("product").renameColumn("given_at", "created_at").execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("payment").renameColumn("created_at", "given_at").execute()
}
