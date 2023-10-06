import { type Kysely } from "kysely";

import { createTableWithDefaults } from "../utils";

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("notification_permissions", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", "text", (col) => col.notNull().unique().references("ow_user.id").onDelete("cascade"))
    .addColumn("applications", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("new_articles", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("standard_notifications", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("group_messages", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("markRules_updates", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("receipts", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("registration_by_administrator", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("registration_start", "boolean", (col) => col.notNull().defaultTo(true))
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable("notification_permissions").execute();
}
