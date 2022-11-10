/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType("event_status", ["tba", "open"])

  pgm.createTable("event", {
    id: "id",
    created_at: "created_at",
    updated_at: "updated_at",
    title: { type: "varchar(255)", notNull: true },
    start: { type: "timestamp", notNull: true },
    end: { type: "timestamp", notNull: true },
    status: { type: "event_status", notNull: true },
    public: { type: "boolean", notNull: true },
    description: { type: "text" },
    subtitle: { type: "varchar(255)" },
    image_url: { type: "varchar(255)" },
    location: { type: "varchar(255)" },

    committee_id: { type: "uuid", references: "committee" },
  })

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
    id: { type: "uuid", notNull: true, primaryKey: true },
    created_at: "created_at",
    updated_at: "updated_at",
    user_id: { type: "uuid", references: "user" },
    attendance_id: { type: "uuid", references: "attendance" },
  })

  pgm.createIndex("attendee", ["user_id", "attendance_id"], { unique: true })

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
