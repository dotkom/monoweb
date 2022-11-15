import { Kysely } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await createTableWithDefaults("Company", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("phone", "varchar(69)")
    .addColumn("email", "varchar(69)", (col) => col.notNull().unique())
    .addColumn("website", "varchar(100)", (col) => col.notNull())
    .addColumn("location", "varchar(100)")
    .addColumn("type", "varchar(100)")
    .execute()

  // Create a table for committee based on the old migration
  await createTableWithDefaults("Committee", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<Database>) {
  await db.schema.dropTable("Committee").execute()
  await db.schema.dropTable("Company").execute()
}
