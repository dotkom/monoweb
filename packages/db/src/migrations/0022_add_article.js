import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("articles", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("author", "text", (col) => col.notNull())
    .addColumn("photographer", "text", (col) => col.notNull())
    .addColumn("image_url", "text", (col) => col.notNull())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("excerpt", "text", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .execute()
  await db.schema
    .createTable("article_tags")
    .addColumn("name", "text", (col) => col.primaryKey())
    .execute()
  await db.schema
    .createTable("article_tag_link")
    .addColumn("article", sql`ulid`, (col) => col.references("articles.id").notNull())
    .addColumn("tag", "text", (col) => col.references("article_tags.name").notNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("article_tag_link").execute()
  await db.schema.dropTable("article_tags").execute()
  await db.schema.dropTable("articles").execute()
}
