import { sql } from "kysely";
import { createTableWithDefaults } from "../utils.js";

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults(
    "interest_group",
    { id: true, createdAt: true, updatedAt: true },
    db.schema
  )
    .addColumn("name", sql`text`, (col) => col.notNull())
    .addColumn("description", sql`text`)
    .execute();
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("interest_group").execute();
}
