import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

// Inspiration from sanity: https://www.sanity.io/docs/image-urls
// https://www.sanity.io/docs/image-type
// https://www.sanity.io/docs/file-type
/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("asset", { createdAt: true }, db.schema)
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("original_filename", "text", (col) => col.notNull())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("metadata", "jsonb")
    .execute()

  await createTableWithDefaults("image", { id: true, createdAt: true, updatedAt: false }, db.schema)
    .addColumn("asset_id", "text", (col) => col.references("asset.id").notNull())
    .addColumn("alt_text", "text", (col) => col.notNull())
    .addColumn("crop", "jsonb")
    .execute()

  await db.schema
    .alterTable("offline")
    .dropColumn("file_url")
    .dropColumn("image_url")
    .addColumn("file_id", "text", (col) => col.references("asset.id").notNull())
    .addColumn("image_id", sql`ulid`, (col) => col.references("image.id").notNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("image").execute()
  await db.schema.dropTable("file").execute()
  await db.schema.dropTable("asset").execute()

  await db.schema
    .alterTable("offline")
    .dropColumn("file_id")
    .dropColumn("image_id")
    .addColumn("file_url", "text")
    .addColumn("image_url", "text")
    .execute()
}
