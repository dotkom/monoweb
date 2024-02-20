import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db) {
  // Create table for product information
  await createTableWithDefaults("webshop_product", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("name", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("description", sql`text`, (col) => col.notNull())
    .addColumn("price", sql`integer`, (col) => col.notNull()) // In øre
    .addColumn("image", sql`text`, (col) => col.notNull())
    .execute()

  // Create table for product variants
  await createTableWithDefaults("webshop_product_variant", { id: true, createdAt: true }, db.schema)
    .addColumn("product_id", sql`ulid`, (col) => col.references("webshop_product.id").onDelete("cascade"))
    .addColumn("name", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("stock_quantity", sql`integer`, (col) => col.notNull())
    .execute()
}

export async function down(db) {
  await db.schema.dropTable("webshop_product_variants").execute()
  await db.schema.dropTable("webshop_product").execute()
}
