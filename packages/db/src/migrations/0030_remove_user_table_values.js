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

  // remove table key constraints
  await db.schema.alterTable("ow_user").dropConstraint("ow_user_pkey").execute()
  await db.schema
    .alterTable("ow_user")
    .dropColumn("id")
    .dropColumn("family_name")
    .dropColumn("middle_name")
    .dropColumn("given_name")
    .dropColumn("picture")
    .dropColumn("allergies")
    .dropColumn("phone")
    .dropColumn("gender")
    .dropColumn("email")
    .dropColumn("name")
    .dropColumn("last_synced_at")
    .dropColumn("updated_at")
    .dropColumn("created_at")
    .dropColumn("study_year")
    .execute()

  await db.schema.alterTable("ow_user").renameColumn("auth0_id", "id").execute()

  await db.schema.alterTable("ow_user").addPrimaryKeyConstraint("ow_user_pkey", ["id"]).execute()

  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema
      .alterTable(table)
      .alterColumn(column, (col) => col.setDataType("varchar(50)"))
      .execute()

    await db.schema.alterTable(table).addForeignKeyConstraint(constraint, [column], "ow_user", ["id"]).execute()
  }
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema.alterTable(table).dropConstraint(constraint).execute()

    await db.schema
      .alterTable(table)
      .alterColumn(column, (col) => col.setDataType("varchar(255)"))
      .execute()
  }

  await db.schema.alterTable("ow_user").dropConstraint("ow_user_pkey").execute()

  await db.schema.alterTable("ow_user").renameColumn("id", "auth0_id").execute()

  await db.schema
    .alterTable("ow_user")
    .addColumn("id", sql`ulid`, (col) => col.primaryKey().defaultTo(sql`gen_ulid()`))
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
    await db.schema.alterTable(table).dropColumn(column).execute()

    await db.schema
      .alterTable(table)
      .addColumn(column, sql`ulid`, (col) => col.references("ow_user.id"))
      .execute()
  }
}
