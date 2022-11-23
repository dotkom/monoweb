import { Kysely, sql } from "kysely"

import { Database } from "../types"
import { createTableWithDefaults } from "../utils"

export async function up(db: Kysely<Database>) {
  await db.schema.createType("event_status").asEnum(["tba", "open"]).execute()

  await createTableWithDefaults("Event", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("start", "timestamptz", (col) => col.notNull())
    .addColumn("end", "timestamptz", (col) => col.notNull())
    .addColumn("status", sql`event_status`, (col) => col.notNull())
    .addColumn("public", "boolean", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("subtitle", "varchar(255)")
    .addColumn("image_url", "varchar(255)")
    .addColumn("location", "varchar(255)")
    .addColumn("committee_id", "uuid", (col) => col.references("Committee.id").onDelete("set null"))
    .execute()

  await createTableWithDefaults("Attendance", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("start", "timestamptz", (col) => col.notNull())
    .addColumn("end", "timestamptz", (col) => col.notNull())
    .addColumn("deregister_deadline", "timestamptz", (col) => col.notNull())
    .addColumn("limit", "integer", (col) => col.notNull())
    .addColumn("event_id", "uuid", (col) => col.references("Event.id").onDelete("cascade"))
    .execute()

  await createTableWithDefaults("Attendee", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("user_id", "uuid", (col) => col.references("User.id").onDelete("cascade"))
    .addColumn("attendance_id", "uuid", (col) => col.references("Attendance.id").onDelete("cascade"))
    .execute()

  await db.schema
    .createIndex("Attendee_user_attendance_unique_index")
    .on("Attendee")
    .columns(["user_id", "attendance_id"])
    .unique()
    .execute()

  await db.schema
    .createTable("EventCompany")
    .addColumn("event_id", "uuid", (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("company_id", "uuid", (col) => col.references("company.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("EventCompany_pk", ["event_id", "company_id"])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("Attendee").execute()
  await db.schema.dropTable("Attendance").execute()
  await db.schema.dropTable("EventCompany").execute()
  await db.schema.dropTable("Event").execute()
  await db.schema.dropType("event_status").execute()
}
