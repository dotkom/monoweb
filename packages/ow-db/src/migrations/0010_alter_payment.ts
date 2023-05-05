import { Kysely, sql } from "kysely"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<any>) {
  await db.schema.createType("refund_request_status").asEnum(["PENDING", "APPROVED", "REJECTED"]).execute()

  await db.schema
    .alterTable("product")
    .addColumn("is_refundable", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("refund_requires_approval", "boolean", (col) => col.notNull().defaultTo(true))
    .execute()

  await db.schema
    .alterTable("payment")
    .addColumn("payment_provider_session_id", "text", (col) => col.notNull())
    .alterColumn("payment_provider_order_id", (col) => col.dropNotNull())
    .execute()

  await createTableWithDefaults("refund_request", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("payment_id", "uuid", (col) => col.unique().references("payment.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("status", sql`refund_request_status`, (col) => col.notNull().defaultTo("PENDING"))
    .addColumn("handled_by", "text", (col) => col.references("ow_user.id").onDelete("cascade"))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable("payment")
    .dropColumn("payment_provider_session_id")
    .alterColumn("payment_provider_order_id", (col) => col.setNotNull())
    .execute()

  await db.schema.alterTable("product").dropColumn("is_refundable").dropColumn("refund_requires_approval").execute()

  await db.schema.dropTable("refund_request").execute()
  await db.schema.dropType("refund_request_status").execute()
}
