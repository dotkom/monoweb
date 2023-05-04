import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema.createType("refund_request_status").asEnum(["PENDING", "APPROVED", "REJECTED"]).execute()

  await db.schema
    .alterTable("product")
    .addColumn("is_refundable", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("refund_needs_approval", "boolean", (col) => col.notNull().defaultTo(true))
    .execute()

  await db.schema
    .alterTable("payment")
    .addColumn("payment_provider_session_id", "text", (col) => col.notNull())
    .alterColumn("payment_provider_order_id", (col) => col.dropNotNull())
    .execute()

  await db.schema
    .createTable("refund_request")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo("now()"))
    .addColumn("payment_id", "uuid", (col) => col.references("payment.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("status", sql`refund_request_status`, (col) => col.notNull().defaultTo("PENDING"))
    .addColumn("handled_by", "text", (col) => col.references("ow_user.id").onDelete("cascade"))
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable("payment")
    .dropColumn("payment_provider_session_id")
    .alterColumn("payment_provider_order_id", (col) => col.setNotNull())
    .execute()

  await db.schema
    .alterTable("product")
    .dropColumn("is_refundable")
    .dropColumn("refund_needs_approval")
    .execute()

  await db.schema.dropTable("refund_request").execute()
  await db.schema.dropTable("refund_request_status").execute()
}
