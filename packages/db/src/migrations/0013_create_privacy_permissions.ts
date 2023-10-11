import { Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("privacy_permissions", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.notNull().unique().references("ow_user.id").onDelete("cascade"))
    .addColumn("profile_visible", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("username_visible", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("email_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("phone_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("address_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("attendance_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("privacy_permissions").execute()
}
