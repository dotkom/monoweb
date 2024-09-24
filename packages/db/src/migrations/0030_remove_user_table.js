import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("waitlist_attendee")
    .dropConstraint("waitlist_attendee_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("waitlist_attendee")
    .alterColumn("user_id", (col) => col.setDataType("varchar(255)"))
    .execute()
  
  await db.deleteFrom("waitlist_attendee").execute()

  await db.schema
    .alterTable("attendee")
    .dropConstraint("attendee_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("attendee")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("attendee")
    .execute()

  await db.schema
    .alterTable("personal_mark")
    .dropConstraint("personal_mark_user_id_fkey")
    .execute()

  await db.schema
    .alterTable("personal_mark")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("personal_mark")
    .execute()

  await db.schema
    .alterTable("payment")
    .dropConstraint("payment_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("payment")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("payment")
    .execute()
  
  await db.schema
    .alterTable("refund_request")
    .dropConstraint("refund_request_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("refund_request")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
   
  await db.schema
    .alterTable("refund_request")
    .dropConstraint("refund_request_handled_by_fkey")
    .execute()
  
  await db.schema
    .alterTable("refund_request")
    .alterColumn("handled_by", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("refund_request")
    .execute()
  
  await db.schema
    .alterTable("privacy_permissions")
    .dropConstraint("privacy_permissions_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("privacy_permissions")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("privacy_permissions")
    .execute()
  
  await db.schema
    .alterTable("notification_permissions")
    .dropConstraint("notification_permissions_user_id_fkey")
    .execute()
  
  await db.schema
    .alterTable("notification_permissions")
    .alterColumn("user_id", col => col.setDataType("varchar(255)"))
    .execute()
  
  await db
    .deleteFrom("notification_permissions")
    .execute()
  
  await db.schema
    .dropTable("ow_user")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .createTable("ow_user")
    .addColumn("id", sql`ulid`, (col) => col.primaryKey().defaultTo(sql`gen_ulid()`))
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("picture", "varchar(255)")
    .addColumn("allergies", "json", (col) => col.notNull())
    .addColumn("phone", "varchar(255)")
    .addColumn("gender", "varchar(255)")
    .addColumn("auth0_id", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("last_synced_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("study_year", "integer", (col) => col.notNull().defaultTo(-1))
    .addColumn("family_name", "varchar(255)", (col) => col.notNull())
    .addColumn("middle_name", "varchar(255)", (col) => col.notNull())
    .addColumn("given_name", "varchar(255)", (col) => col.notNull())
    .addColumn("email", "varchar(255)")
    .execute()
}
