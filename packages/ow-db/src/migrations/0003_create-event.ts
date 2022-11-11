import { Kysely, sql } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await db.schema.createType("event_status").asEnum(["tba", "open"]).execute()

  await createTableWithDefaults("event", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("start", "timestamp", (col) => col.notNull())
    .addColumn("end", "timestamp", (col) => col.notNull())
    .addColumn("status", sql`event_status`, (col) => col.notNull())
    .addColumn("public", "boolean", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("subtitle", "varchar(255)")
    .addColumn("image_url", "varchar(255)")
    .addColumn("location", "varchar(255)")
    .addColumn("committee_id", "uuid", (col) => col.references("committee.id").onDelete("set null"))
    .execute()

  await createTableWithDefaults("attendance", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("start", "timestamp", (col) => col.notNull())
    .addColumn("end", "timestamp", (col) => col.notNull())
    .addColumn("deregister_deadline", "timestamp", (col) => col.notNull())
    .addColumn("limit", "integer", (col) => col.notNull())
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade"))
    .execute()

  await createTableWithDefaults("attendee", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", "uuid", (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("attendance_id", "uuid", (col) => col.references("attendance.id").onDelete("cascade"))
    .execute()

  await db.schema
    .createIndex("user_attendance_unique_index")
    .on("attendee")
    .columns(["user_id", "attendance_id"])
    .unique()
    .execute()

  await db.schema
    .createTable("event_company")
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("company_id", "uuid", (col) => col.references("company.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_company_pk", ["event_id", "company_id"])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("user_attendance_unique_index").execute()
  await db.schema.dropTable("attendee").execute()
  await db.schema.dropTable("attendance").execute()
  await db.schema.dropTable("event_company").execute()
  await db.schema.dropTable("event").execute()
  await db.schema.dropType("event_status").execute()
}
