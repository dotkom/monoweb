import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("notification_permissions", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.notNull().unique().references("ow_user.id").onDelete("cascade"))
    .addColumn("applications", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("new_articles", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("standard_notifications", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("group_messages", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("markRules_updates", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("receipts", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("registration_by_administrator", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("registration_start", "boolean", (col) => col.notNull().defaultTo(true))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("notification_permissions").execute()
}
