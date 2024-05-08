import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

// Inspiration from sanity: https://www.sanity.io/docs/image-urls
// https://www.sanity.io/docs/image-type
// https://www.sanity.io/docs/file-type
/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("asset", { createdAt: true }, db.schema)
    .addColumn("key", "text", (col) => col.notNull().primaryKey())
    .addColumn("original_filename", "text", (col) => col.notNull())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("size", "integer", (col) => col.notNull())
    .addColumn("mime_type", "text", (col) => col.notNull())
    .addColumn("tags", "jsonb")

    .addColumn("is_image", "boolean", (col) => col.notNull())

    .addColumn("width", "integer") // will be null for non image assets
    .addColumn("height", "integer") // will be null for non image assets
    .addColumn("alt_text", "text") // will be null for non image assets
    .addColumn("photographer", "text") // will be null for non image assets
    .execute()

  await createTableWithDefaults("image_variant", { id: true, createdAt: true, updatedAt: false }, db.schema)
    .addColumn("asset_key", "text", (col) => col.references("asset.key").notNull())
    .addColumn("crop", "jsonb")
    .execute()

  await db.schema
    .alterTable("offline")
    .dropColumn("file_url")
    .dropColumn("image_url")
    .addColumn("pdf_asset_key", "text", (col) => col.references("asset.key"))
    .addColumn("image_variant_id", sql`ulid`, (col) => col.references("image_variant.id"))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("asset").execute()
  await db.schema.dropTable("image_variant").execute()

  await db.schema
    .alterTable("offline")
    .dropColumn("pdf_asset_key")
    .dropColumn("image_variant_id")
    .addColumn("file_url", "text")
    .addColumn("image_url", "text")
    .execute()
}
