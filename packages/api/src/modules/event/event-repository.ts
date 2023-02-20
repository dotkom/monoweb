import { Database } from "@dotkomonline/db"
import { Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable, sql } from "kysely"

const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export interface EventRepository {
  create: (data: Insertable<Database["event"]>) => Promise<Event>
  get: () => Promise<Event[]>
  getById: (id: string) => Promise<Event | undefined>
  update: (eventID: string, data: EventWrite) => Promise<Event>
}

export const initEventRepository = (db: Kysely<Database>): EventRepository => ({
  create: async (data) => {
    const event = await db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  },
  get: async () => {
    const events = await db.selectFrom("event").selectAll().execute()
    return events.map(mapToEvent)
  },
  getById: async (id) => {
    const event = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()
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
