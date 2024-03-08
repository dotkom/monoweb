import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("last_synced_at", "timestampz", (col) => col.defaultTo(sql`now()`))
    .addColumn("study_year", "integer", (col) => col.defaultTo(-1))
    .execute()

  // populate data for new columns
  const users = await db.selectFrom("ow_user").selectAll().execute()
  for (const user of users) {
    const email = `${user.id}@invalid.local`
    await db
      .updateTable("ow_user")
      .set({ email, name: user.id, updated_at: sql`now()`, last_synced_at: sql`now()`, study_year: -1 })
      .where("id", "=", user.id)
      .execute()
  }

  // enforce constraints
  await db.schema.alterTable("ow_user").addUniqueConstraint("", ["email"]).execute()
  await db.schema
    .alterTable("ow_user")
    .alterColumn("email", (col) => col.setNotNull())
    .alterColumn("name", (col) => col.setNotNull())
    .alterColumn("updated_at", (col) => col.setNotNull())
    .alterColumn("last_synced_at", (col) => col.setNotNull())
    .alterColumn("study_year", (col) => col.setNotNull())
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
