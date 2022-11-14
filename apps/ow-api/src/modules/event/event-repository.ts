import { Database } from "@dotkomonline/db"
import { Insertable, Kysely } from "kysely"

import { Event, mapToEvent } from "./event"

export interface EventRepository {
  createEvent: (data: Insertable<Database["event"]>) => Promise<Event | undefined>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
  getEventByID: (id: string) => Promise<Event | undefined>
}

export const initEventRepository = (db: Kysely<Database>): EventRepository => ({
  createEvent: async (data) => {
    const event = await db.insertInto("event").values(data).returningAll().executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  },
  getEvents: async (limit, offset = 0) => {
    const events = await db.selectFrom("event").selectAll().limit(limit).offset(offset).execute()
    return events.map(mapToEvent)
  },
  getEventByID: async (id) => {
    const event = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  },
})
