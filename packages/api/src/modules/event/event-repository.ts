import { Database } from "@dotkomonline/db"
import { Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"
import { z } from "zod"

const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

const keys = EventSchema.keyof()

export interface EventRepository {
  create(data: EventWrite): Promise<Event | undefined>
  update(id: Event["id"], data: Omit<EventWrite, "id">): Promise<Event>
  all(cursor?: Event["id"], orderBy?: z.infer<typeof keys>, limit?: number): Promise<Event[]>
  getById(id: string): Promise<Event | undefined>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: EventWrite): Promise<Event | undefined> {
    const event = await this.db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  }
  async update(id: Event["id"], data: Omit<EventWrite, "id">): Promise<Event> {
    const event = await this.db
      .updateTable("event")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToEvent(event)
  }
  async all(cursor?: Event["id"], _orderBy?: z.infer<typeof keys>, limit?: number): Promise<Event[]> {
    let query = this.db.selectFrom("event").selectAll()
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
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  }
}
