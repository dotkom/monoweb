import { Database } from "@dotkomonline/db"
import { Attendance, AttendanceSchema, AttendanceWrite, Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable, sql } from "kysely"

const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export interface EventRepository {
  create: (data: Insertable<Database["event"]>) => Promise<Event>
  get: (limit: number, offset?: number) => Promise<Event[]>
  getById: (id: string) => Promise<Event | undefined>
  update: (eventID: string, data: EventWrite) => Promise<Event>
}

export const initEventRepository = (db: Kysely<Database>): EventRepository => ({
  create: async (data) => {
    const event = await db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  },
  get: async (limit, offset = 0) => {
    const events = await db.selectFrom("event").selectAll().limit(limit).offset(offset).execute()
    return events.map(mapToEvent)
  },
  getById: async (id) => {
    // TODO: move the attendance query to a helper

    const event = await db
      .selectFrom("event")
      .where("id", "=", id)
      .leftJoin("attendance", "attendance.eventId", "event.id")
      .selectAll("event")
      .select(
        sql<Attendance[]>`COALESCE(json_agg(attendance) FILTER (WHERE attendance.id IS NOT NULL), '[]')`.as(
          "attendances"
        )
      )
      .groupBy("event.id")
      .executeTakeFirstOrThrow()

    return event ? mapToEvent(event) : undefined
  },
  update: async (eventID: string, data) => {
    const event = await db
      .updateTable("event")
      .set(data)
      .where("id", "=", eventID)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToEvent(event)
  },
})
