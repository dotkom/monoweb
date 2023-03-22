import { Kysely } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await createTableWithDefaults("profile", { id: false, createdAt: false, updatedAt: true }, db.schema)
    .addColumn("user_id", "uuid", (col) => col.primaryKey().references("ow_user.id").onDelete("cascade"))
    .addColumn("show_name", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("show_email", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("show_adress", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("allow_pictures", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("visible_for_other_users", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("visible_in_events", "boolean", (col) => col.notNull().defaultTo(false))
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("profile").execute()
}
