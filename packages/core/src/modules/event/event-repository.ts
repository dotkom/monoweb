import { Database } from "@dotkomonline/db"
import { Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"
import { Cursor, paginateQuery } from "../../utils/db-utils"

export const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export interface EventRepository {
  create(data: EventWrite): Promise<Event | undefined>
  update(id: Event["id"], data: Omit<EventWrite, "id">): Promise<Event>
  getAll(take: number, cursor?: Cursor): Promise<Event[]>
  getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
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
  async getAll(take: number, cursor?: Cursor): Promise<Event[]> {
    let query = this.db.selectFrom("event").selectAll().limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map(mapToEvent)
  }
  async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    let query = this.db.selectFrom("event").selectAll().where("committeeId", "=", committeeId).limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map(mapToEvent)
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()
    return event ? mapToEvent(event) : undefined
  }
}
