import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("ow_user")
    .alterColumn("id", (col) => col.setDefault(sql`gen_random_uuid()`))
    .execute()
}

export async function down(db: Kysely<any>) {
  // May be missing a .execute()? Otherwise, the await should be safe to remove (?)
  // eslint-disable-next-line @typescript-eslint/await-thenable
  await db.schema.alterTable("ow_user").alterColumn("id", (col) => col.setDefault(sql`""`))
}
