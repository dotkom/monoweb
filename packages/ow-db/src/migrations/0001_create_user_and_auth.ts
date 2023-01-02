import { Kysely, sql } from "kysely"

import { createTableWithDefaults } from "../utils"

// Kysely reccomends using "any" in migrations

export async function up(db: Kysely<any>): Promise<void> {
  await createTableWithDefaults("ow_user", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(255)")
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("email_verified", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("password", "varchar(255)", (col) => col.notNull())
    .addColumn("image", "varchar(255)")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("ow_user").execute()
}
