import { Database } from "@dotkomonline/db"
import { Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"
import { z } from "zod"

const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

const keys = EventSchema.keyof()

export interface EventRepository {
  create: (data: EventWrite) => Promise<Event | undefined>
  update: (id: Event["id"], data: Omit<EventWrite, "id">) => Promise<Event>
  get: (cursor?: Event["id"], orderBy?: z.infer<typeof keys>, limit?: number) => Promise<Event[]>
  getById: (id: string) => Promise<Event | undefined>
}

export const initEventRepository = (db: Kysely<Database>): EventRepository => ({
  create: async (data) => {
    const event = await db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  },
  get: async (cursor, _orderBy = "createdAt", limit = 20) => {
    let query = db.selectFrom("event").selectAll()
    if (cursor) {
      query = query.where("id", ">", cursor)
    }
    // TODO: no ordering for now
    // if (orderBy) {
    //   query = query.orderBy("createdAt", "desc")
    // }
    if (limit) {
      query = query.limit(limit)
    }
    const events = await query.execute()
    return events.map(mapToEvent)
  },
  getById: async (id) => {
    const event = await db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  },
  update: async (id, data) => {
    const event = await db.updateTable("event").set(data).where("id", "=", id).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  },
})
