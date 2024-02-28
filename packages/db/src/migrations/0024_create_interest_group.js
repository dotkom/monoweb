import { sql } from "kysely";

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .createTable("interest_group")
    .addColumn("interest_group_id", sql`ulid`, (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().default(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().default(sql`now()`)
    )
    .execute();
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("interest_group").execute();
}
