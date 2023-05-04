import { Kysely } from "kysely"

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable("payment")
    .addColumn("paymentProviderSessionId", "text", (col) => col.notNull())
    .alterColumn("paymentProviderOrderId", (col) => col.dropNotNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable("payment")
    .dropColumn("paymentProviderSessionId")
    .alterColumn("paymentProviderOrderId", (col) => col.setNotNull())
    .execute()
}
