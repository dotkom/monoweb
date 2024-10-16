import { sql } from "kysely"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.alterTable("ow_user")
    .dropColumn("middleName").dropColumn("lastSyncedAt").execute()
  
  await db.schema.alterTable("ow_user")
    .dropColumn("allergies").execute()

  await db.schema.alterTable("ow_user")
    .addColumn("allergies", "text", col => col.notNull()).execute()

  await db.schema.alterTable("ow_user")
    .alterColumn("studyYear", col => col.dropNotNull()).execute()
  
  await db.schema.alterTable("ow_user")
    .alterColumn("studyYear", col => col.setDefault(sql`null`)).execute()

  await db.schema.alterTable("ow_user")
    .alterColumn("phone", col => col.setNotNull()).execute()
  
  await db.schema.alterTable("ow_user")
    .addColumn("biography", "text", col => col.defaultTo("").notNull()).execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema
    .alterTable("ow_user")
    .addColumn("middleName", "text")
    .addColumn("lastSyncedAt", "timestamptz")
    .execute()

  await db.schema
    .alterTable("ow_user")
    .dropColumn("allergies")
    .execute()

  await db.schema
    .alterTable("ow_user")
    .addColumn("allergies", "json")
    .execute()

  await db.schema.alterTable("ow_user")
    .alterColumn("studyYear", col => col.setDefault(sql`'-1'::integer`)).execute()

  await db.schema.alterTable("ow_user")
    .alterColumn("phone", col => col.dropNotNull()).execute()
  
  await db.schema.alterTable("ow_user")
    .dropColumn("biography").execute()
}
