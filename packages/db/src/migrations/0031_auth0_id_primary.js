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
    await db.schema.alterTable(table)
      .dropConstraint(constraint)
      .execute();
    
    await db.schema.alterTable(table)
      .alterColumn(column, (col) => col.setDataType("varchar(50)"))
      .execute();
  }
  
  await db.schema.alterTable("ow_user")
    .dropConstraint("ow_user_pkey")
    .execute()
  
  await db.schema.alterTable("ow_user")
    .addPrimaryKeyConstraint("ow_user_pkey", ["auth0_id"])
    .execute()

  // drop the id column
  await db.schema.alterTable("ow_user")
    .dropColumn("id")
    .execute()
  
  // rename auth0_id to id
  await db.schema.alterTable("ow_user")
    .renameColumn("auth0_id", "id")
    .execute()
  
  for (const [table, constraint, column] of owUserIdForeignKeys) {
    console.log(`Adding foreign key constraint for ${table}.${column}`)
    await db.schema.alterTable(table)
      .addForeignKeyConstraint(constraint, [column], "ow_user", ["id"])
      .execute()
  }
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema.alterTable(table)
      .dropConstraint(constraint)
      .execute();
    
    await db.schema.alterTable(table)
      .dropColumn(column)
      .execute()
    
    await db.schema.alterTable(table)
      .addColumn(column, sql`ulid`)
      .execute()
  }

  await db.schema.alterTable("ow_user")
    .dropConstraint("ow_user_pkey")
    .execute()
  
  await db.schema.alterTable("ow_user")
    .renameColumn("id", "auth0_id")
    .execute()
  
  await db.schema.alterTable("ow_user")
    .addColumn("id", sql`ulid`, (col) => col.defaultTo(sql`gen_ulid()`).primaryKey())
    .execute()
  
  for (const [table, constraint, column] of owUserIdForeignKeys) {
    await db.schema.alterTable(table)
      .addForeignKeyConstraint(constraint, [column], "ow_user", ["id"])
      .execute()
  }
}
