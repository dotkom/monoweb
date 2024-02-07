import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .alterTable("event")
    .addColumn("waitlist", sql`ulid`, (col) => col.references("attendance.id").defaultTo(null))
    .execute()
  await db.schema
    .alterTable("attendance")
    .addColumn("min", "integer", (col) => col.notNull().defaultTo(0))
    .execute()
  await db.schema
    .alterTable("attendance")
    .addColumn("max", "integer", (col) => col.notNull().defaultTo(0))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("event").dropColumn("waitlist").execute()
  await db.schema.alterTable("attendance").dropColumn("min").execute()
  await db.schema.alterTable("attendance").dropColumn("max").execute()
}
