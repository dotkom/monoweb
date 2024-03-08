import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("last_synced_at", "timestamp with time zone", (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  // populate data for new columns
  const users = await db.selectFrom("ow_user").selectAll().execute()
  for (const user of users) {
    const email = `${user.id}@invalid.local`
    const name = `${user.id}`
    await db.updateTable("ow_user").set({ email, name }).where("id", "=", user.id).execute()
  }

  // enforce constraints
  // await db.schema.alterTable("ow_user").alterColumn("email", (col) => col.notNullable()).alterColumn("name", (col) => col.notNullable()).execute()
  await db.schema.alterTable("ow_user").addUniqueConstraint("", ["email"]).execute()
  await db.schema
    .alterTable("ow_user")
    .alterColumn("email", (col) => col.setNotNull())
    .execute()
  await db.schema
    .alterTable("ow_user")
    .alterColumn("name", (col) => col.setNotNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .dropColumn("email")
    .dropColumn("name")
    .dropColumn("last_synced_at")
    .dropColumn("updated_at")
    .execute()
}
