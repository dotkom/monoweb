import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("privacy_permissions", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", "varchar(255)", (col) =>
      col.notNull().unique().references("ow_user.auth0_id").onDelete("cascade")
    )
    .addColumn("profile_visible", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("username_visible", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("email_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("phone_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("address_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("attendance_visible", "boolean", (col) => col.notNull().defaultTo(false))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("privacy_permissions").execute()
}
