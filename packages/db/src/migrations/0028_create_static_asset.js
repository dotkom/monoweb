import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("static_asset", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("file_type", "text", (col) => col.notNull())
    .addColumn("url", "text", (col) => col.notNull())
    .execute()

  await db.schema
    .alterTable("offline")
    .dropColumn("file_url")
    .dropColumn("image_url")
    .addColumn("file_id", sql`ulid`, (col) => col.references("static_asset.id").onDelete("cascade"))
    .addColumn("image_id", sql`ulid`, (col) => col.references("static_asset.id").onDelete("cascade"))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("static_asset").execute()
}
