import { Kysely } from "kysely"

import { createTableWithDefaults } from "../utils"

// Kysely reccomends using "any" in migrations

export async function up(db: Kysely<any>): Promise<void> {
  await createTableWithDefaults("ow_user", { createdAt: true }, db.schema)
    .addColumn("id", "text", (col) => col.primaryKey())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("ow_user").execute()
}
