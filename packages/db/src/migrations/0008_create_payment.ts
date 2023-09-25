import { Kysely, sql } from "kysely"

import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await db.schema.createType("payment_provider").asEnum(["STRIPE"]).execute()
  await db.schema.createType("product_type").asEnum(["EVENT"]).execute()
  await db.schema.createType("payment_status").asEnum(["UNPAID", "PAID", "REFUNDED"]).execute()

  await createTableWithDefaults("product", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("type", sql`product_type`, (col) => col.notNull())
    .addColumn("object_id", sql`ulid`, (col) => col.unique())
    .addColumn("amount", "integer", (col) => col.notNull())
    .addColumn("deleted_at", "timestamptz")
    .execute()

  await createTableWithDefaults("payment", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("product_id", sql`ulid`, (col) => col.references("product.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.references("ow_user.id").onDelete("cascade")) // change to varchar(255) when anhkha fixes user:))))
    .addColumn("payment_provider_id", "varchar(255)", (col) => col.notNull())
    .addColumn("payment_provider_order_id", "varchar(255)", (col) => col.notNull())
    .addColumn("status", sql`payment_status`, (col) => col.notNull())
    .execute()

  await db.schema
    .createTable("product_payment_provider")
    .addColumn("product_id", sql`ulid`, (col) => col.references("product.id").onDelete("cascade"))
    .addColumn("payment_provider", sql`payment_provider`, (col) => col.notNull())
    .addColumn("payment_provider_id", "varchar(255)", (col) => col.notNull())
    .addPrimaryKeyConstraint("product_payment_provider_pk", ["product_id", "payment_provider_id"])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("product_payment_provider").execute()
  await db.schema.dropTable("payment").execute()
  await db.schema.dropTable("product").execute()
  await db.schema.dropType("payment_provider").execute()
  await db.schema.dropType("product_type").execute()
  await db.schema.dropType("payment_status").execute()
}
