/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("event", {
    id: "id",
    created_at: "created_at",
    title: { type: "varchar(255)", notNull: true },
    start: { type: "timestamp", notNull: true },
    end: { type: "timestamp", notNull: true },
    public: { type: "boolean", notNull: true },
    subtitle: { type: "varchar(255)" },
    image_url: { type: "varchar(255)" },
    description: { type: "text" },
    location: { type: "varchar(255)" },

    committee_id: { type: "uuid", references: "committee" },
  })

  // Create a table from the Attendance Model
  pgm.createTable("attendance", {
    id: "id",
    created_at: "created_at",
    updated_at: "updated_at",
    start: { type: "timestamp", notNull: true },
    end: { type: "timestamp", notNull: true },
    deregister_deadline: { type: "timestamp", notNull: true },
    limit: { type: "integer", notNull: true },

    event_id: { type: "uuid", references: "event" },
  })

  pgm.createTable("attendee", {
    created_at: "created_at",
    updated_at: "updated_at",
    attendance_id: { type: "uuid", references: "attendance" },
    event_id: { type: "uuid", references: "event" },
  })
  pgm.createIndex("attendee", ["attendance_id", "event_id"], { unique: true })

  pgm.createTable("event_company", {
    event_id: { type: "uuid", references: "event", primaryKey: true },
    company_id: { type: "uuid", references: "company", primaryKey: true },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("attendee")
  pgm.dropTable("attendance")
  pgm.dropTable("event_company")
  pgm.dropTable("event")
}
