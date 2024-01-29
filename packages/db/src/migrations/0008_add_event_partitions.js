import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("event")
    .addColumn("waitlist", sql`ulid`, (col) => col.references("attendance.id").defaultTo(null))
    .execute()
  await db.schema
    .alterTable("attendance")
    .addColumn("min", "integer", (col) => col.notNull().defaultTo(0)) // Inclusive
    .execute()
  await db.schema
    .alterTable("attendance")
    .addColumn("max", "integer", (col) => col.notNull().defaultTo(0)) // Exclusive
    .execute()

  // 1 - 3 year -> min: 1, max: 4
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("event").dropColumn("waitlist").execute()
  await db.schema.alterTable("attendance").dropColumn("min").execute()
  await db.schema.alterTable("attendance").dropColumn("max").execute()
}
