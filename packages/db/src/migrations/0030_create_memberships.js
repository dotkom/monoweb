import { sql } from "kysely"
import { createTableWithDefaults } from "../utils"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema
    .createType("field_of_study")
    .asEnum([
      "BACHELOR",
      "MASTER_SOFTWARE_ENGINEERING",
      "MASTER_DATABASE_AND_SEARCH",
      "MASTER_ALGORITHMS",
      "MASTER_GAME_TECHNOLOGY",
      "MASTER_ARTIFICIAL_INTELLIGENCE",
      "MASTER_HEALTH_INFORMATICS",
      "MASTER_INTERACTION_DESIGN",
      "MASTER_OTHER",
      "SOCIAL_MEMBER",
      "PHD",
      "INTERNATIONAL",
      "OTHER_MEMBER",
    ])
    .execute()

  await createTableWithDefaults("memberships", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.notNull().references("ow_user.id").primaryKey().onDelete("cascade"))
    .addColumn("field_of_study", sql`field_of_study`, (col) => col.notNull())
    .addColumn("class_year", "integer", (col) => col.notNull())
    .execute()

  await db.schema
    .alterTable("ow_user")
    .addColumn("membership_id", sql`ulid`, (col) => col.references("memberships.user_id").onDelete("set null"))
    .execute()

  await db.schema.createType("membership_request_status").asEnum(["PENDING", "ACCEPTED", "REJECTED"]).execute()

  await createTableWithDefaults("membership_requests", { createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", sql`ulid`, (col) => col.notNull().references("ow_user.id").primaryKey().onDelete("cascade"))
    .addColumn("field_of_study", sql`field_of_study`, (col) => col.notNull())
    .addColumn("class_year", "integer", (col) => col.notNull())
    .addColumn("status", sql`membership_request_status`, (col) => col.notNull())
    .addColumn("preapproved", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("documentation", "json")
    .addColumn("comment", "text")
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.alterTable("ow_user").dropColumn("membership_id").execute()
  await db.schema.dropTable("membership_requests").execute()
  await db.schema.dropTable("memberships").execute()
  await db.schema.dropType("membership_request_status").execute()
  await db.schema.dropType("field_of_study").execute()
}
