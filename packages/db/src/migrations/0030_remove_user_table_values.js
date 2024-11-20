import { sql } from "kysely"

const owUserIdForeignKeys = [
  ["attendee", "attendee_user_id_fkey", "user_id"],
  ["personal_mark", "personal_mark_user_id_fkey", "user_id"],
  ["payment", "payment_user_id_fkey", "user_id"],
  ["privacy_permissions", "privacy_permissions_user_id_fkey", "user_id"],
  ["refund_request", "refund_request_user_id_fkey", "user_id"],
  ["refund_request", "refund_request_handled_by_fkey", "handled_by"],
  ["waitlist_attendee", "waitlist_attendee_user_id_fkey", "user_id"],
  ["notification_permissions", "notification_permissions_user_id_fkey", "user_id"],
]

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema.alterTable(table).dropConstraint(constraint).execute()

    await db.schema
      .alterTable(table)
      .alterColumn(column, (col) => col.setDataType("varchar(50)"))
      .execute()
  }

  await db.schema.dropTable("ow_user").execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .createTable("ow_user")
    .addColumn("id", "varchar(50)", (col) => col.primaryKey())
    .addColumn("auth0_id", "varchar(255)", (col) => col.notNull())
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("middle_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .addColumn("email", "varchar(255)")
    .addColumn("name", "varchar(255)")
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
    .execute()

  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema.alterTable(table).addForeignKeyConstraint(constraint, [column], "ow_user", ["id"]).execute()
  }
}
