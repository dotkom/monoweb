import { Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await createTableWithDefaults("webshop_purchase", { id: true, createdAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.references("owUser.id").onDelete("cascade"))
    .addColumn("stripe_product_id", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("stripe_product_name", sql`character varying(100)`, (col) => col.notNull())
    .addColumn("delivered", sql`boolean`, (col) => col.notNull())
    .execute()
}
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("webshop_purchase").execute()
}
