import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .createType("online_field_of_study")
    .asEnum(["BACHELOR_INFORMATICS", "MASTER_INFORMATICS", "PHD"])
    .execute()

  await createTableWithDefaults("memberships", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.notNull().references("ow_user.id").primaryKey().onDelete("cascade"))
    .addColumn("online_field_of_study", sql`online_field_of_study`)
    .addColumn("class_year", "integer")
    .addColumn("social_membership", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("extraordinary_full_membership", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("studyprogrammeCodes", "json", (col) => col.notNull())
    .execute()

  await db.schema
    .alterTable("ow_user")
    .addColumn("membership_id", sql`ulid`, (col) => col.references("memberships.user_id").onDelete("set null"))
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("ow_user").dropColumn("membership_id").execute()
  await db.schema.dropTable("memberships").execute()
  await db.schema.dropType("online_field_of_study").execute()
}
