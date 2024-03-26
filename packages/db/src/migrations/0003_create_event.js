import { sql } from "kysely"
import { createTableWithDefaults } from "../utils.js"

/** @param db {import('kysely').Kysely} */
export async function up(db) {
  await db.schema.createType("event_status").asEnum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]).execute()

  await createTableWithDefaults("attendance", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("registerStart", "timestamptz", (col) => col.notNull())
    .addColumn("deregisterDeadline", "timestamptz", (col) => col.notNull())
    .addColumn("registerEnd", "timestamptz", (col) => col.notNull())
    .addColumn("mergeTime", "timestamptz", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("attendance_pool", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("attendanceId", sql`ulid`, (col) => col.references("attendance.id").onDelete("cascade").notNull())
    .addColumn("yearCriteria", "json")
    .addColumn("limit", "integer", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("waitlist_attendee", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("attendanceId", sql`ulid`, (col) => col.references("attendance.id").onDelete("cascade"))
    .addColumn("userId", sql`ulid`, (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("position", "integer")
    .addColumn("isPunished", "boolean")
    .addColumn("registeredAt", "timestamptz")
    .addColumn("study_year", "integer", (col) => col.notNull())
    .addColumn("active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("attendance_pool_id", sql`ulid`, (col) => col.references("attendance_pool.id").onDelete("cascade"))
    .addColumn("name", "text", (col) => col.notNull())
    .execute()

  await createTableWithDefaults("attendee", { id: true, createdAt: true, updatedAt: true }, db.schema)
    .addColumn("attendance_id", sql`ulid`, (col) => col.references("attendance.id").onDelete("cascade").notNull())
    .addColumn("user_id", sql`ulid`, (col) => col.references("ow_user.id").onDelete("cascade"))
    .addColumn("attendance_pool_id", sql`ulid`, (col) =>
      col.references("attendance_pool.id").onDelete("cascade").notNull()
    )
    .addColumn("extras_choices", "json")
    .addUniqueConstraint("attendee_unique", ["attendance_id", "user_id"])
    .execute()

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
    .addColumn("attendance_id", sql`ulid`, (col) => col.references("attendance.id").onDelete("cascade"))
    .execute()

  await createTableWithDefaults("event_company", {}, db.schema)
    .addColumn("event_id", sql`ulid`, (col) => col.references("event.id").onDelete("cascade"))
    .addColumn("company_id", sql`ulid`, (col) => col.references("company.id").onDelete("cascade"))
    .addPrimaryKeyConstraint("event_company_pk", ["event_id", "company_id"])
    .execute()
}

/** @param db {import('kysely').Kysely */
export async function down(db) {
  await db.schema.dropTable("attendance_pool").execute()
  await db.schema.dropTable("attendance").execute()
  await db.schema.dropTable("attendee").execute()
  await db.schema.dropTable("event").execute()
}
