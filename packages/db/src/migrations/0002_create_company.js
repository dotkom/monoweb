import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("company", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("phone", "varchar(69)")
    .addColumn("email", "varchar(69)", (col) => col.notNull().unique())
    .addColumn("website", "varchar(100)", (col) => col.notNull())
    .addColumn("location", "varchar(100)")
    .addColumn("type", "varchar(100)")
    .execute()

  // Create a table for committee based on the old migration
  await createTableWithDefaults("committee", { id: true, createdAt: true }, db.schema)
    .addColumn("name", "varchar(100)", (col) => col.notNull())
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("committee").execute()
  await db.schema.dropTable("company").execute()
}
