import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await createTableWithDefaults("interest_group_member", {}, db.schema)
    .addColumn("interest_group_id", sql`uuid`, (col) => col.references("interest_group.id").onDelete("cascade"))
    .addColumn("user_id", sql`text`, (col) => col.references("ow_user.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("interest_group_member_pk", ["interest_group_id", "user_id"])
    .execute()
}

/** @param db {import('kysely').Kysely} */
export async function down(db) {
  await db.schema.dropTable("interest_group_member").execute()
}
