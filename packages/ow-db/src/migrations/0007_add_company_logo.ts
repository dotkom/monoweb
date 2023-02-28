import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.alterTable("company").addColumn("image", "text").execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable("company").dropColumn("image").execute()
}
