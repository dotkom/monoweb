import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.createType("event_status").asEnum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]).execute()

  await createTableWithDefaults("event", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("start", "timestamptz", (col) => col.notNull())
    .addColumn("end", "timestamptz", (col) => col.notNull())
    .addColumn("status", sql`event_status`, (col) => col.notNull())
    .addColumn("public", "boolean", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("subtitle", "varchar(255)")
    .addColumn("image_url", "varchar(255)")
    .addColumn("location", "varchar(255)")
    .addColumn("extras", "json")
    .execute()

  // create table "attendance"
  await createTableWithDefaults("attendance", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("eventId", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("registerStart", "timestamptz", (col) => col.notNull())
    .addColumn("deregisterDeadline", "timestamptz", (col) => col.notNull())
    .addColumn("registerEnd", "timestamptz", (col) => col.notNull())
    .addColumn("mergeTime", "timestamptz", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("attendance_pool", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("max", "integer")
    .addColumn("min", "integer")
    .addColumn("limit", "integer")
    .addColumn("waitlist", sql`ulid`, (col) => col.references("attendance_pool.id").onDelete("cascade"))
    .addColumn("attendanceId", sql`ulid`, (col) => col.references("attendance.id").onDelete("cascade"))
    .execute()

  await createTableWithDefaults("event_company", {}, db.schema)
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("company_id", sql`ulid`, (col) => col.references("company.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_company_pk", ["event_id", "company_id"])
    .execute()

  await createTableWithDefaults("attendee", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("attendancePoolId", sql`ulid`, (col) => col.references("attendance_pool.id").onDelete("cascade"))
    .addColumn("userId", sql`ulid`, (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("extrasChoices", "json")
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("attendance_pool").execute()
  await db.schema.dropTable("attendance").execute()
  await db.schema.dropTable("attendee").execute()
  await db.schema.dropTable("event").execute()
}
