import { Database } from "@dotkomonline/db"
import { Attendance, Event, EventSchema } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable, sql } from "kysely"

const mapToEvent = (data: Selectable<Database["Event"]>) => EventSchema.parse(data)

export interface EventRepository {
  createEvent: (data: Insertable<Database["Event"]>) => Promise<Event | undefined>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
  getEventByID: (id: string) => Promise<Event | undefined>
}

export const initEventRepository = (db: Kysely<Database>): EventRepository => ({
  createEvent: async (data) => {
    const event = await db.insertInto("Event").values(data).returningAll().executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  },
  getEvents: async (limit, offset = 0) => {
    const events = await db.selectFrom("Event").selectAll().limit(limit).offset(offset).execute()
    return events.map(mapToEvent)
  },
  getEventByID: async (id) => {
    // TODO: move the attendance query to a helper

    const event = await db
      .selectFrom("Event")
      .where("id", "=", id)
      .leftJoin("Attendance", "Attendance.eventID", "Event.id")
      .selectAll("Event")
      .select(
        sql<Attendance[]>`COALESCE(json_agg(Attendance) FILTER (WHERE Attendance.id IS NOT NULL), '[]')`.as(
          "attendances"
        )
      )
      .groupBy("Event.id")
      .executeTakeFirst()

    return event ? mapToEvent(event) : undefined
  },
})
