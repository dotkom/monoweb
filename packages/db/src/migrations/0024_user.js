import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  // populate data for new columns
  const users = await db.selectFrom("ow_user").selectAll().execute()
  for (const user of users) {
    const email = `${user.id}@invalid.local`
    const now = new Date()
    await db
      .updateTable("ow_user")
      .set({ email, name: user.id, updated_at: now, last_synced_at: now })
      .where("id", "=", user.id)
      .executeTakeFirst()
  }

  // enforce constraints
  await db.schema.alterTable("ow_user").addUniqueConstraint("", ["email"]).execute()
  await db.schema
    .alterTable("ow_user")
    .alterColumn("email", (col) => col.setNotNull())
    .alterColumn("name", (col) => col.setNotNull())
    .alterColumn("updated_at", (col) => col.setNotNull())
    .alterColumn("last_synced_at", (col) => col.setNotNull())
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
    .dropColumn("study_year")
    .execute()
}
