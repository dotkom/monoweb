import { type Database } from "@dotkomonline/db"
import { type Event, type EventId, EventSchema, type EventWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export interface EventRepository {
  create: (data: EventWrite) => Promise<Event | undefined>
  update: (id: EventId, data: Omit<EventWrite, "id">) => Promise<Event>
  getAll: (take: number, cursor?: Cursor) => Promise<Event[]>
  getAllByCommitteeId: (committeeId: string, take: number, cursor?: Cursor) => Promise<Event[]>
  getById: (id: string) => Promise<Event | undefined>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: EventWrite): Promise<Event | undefined> {
    const event = await this.db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  }

  async update(id: EventId, data: Omit<EventWrite, "id">): Promise<Event> {
    const event = await this.db
      .updateTable("event")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToEvent(event)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Event[]> {
    const query = orderedQuery(this.db.selectFrom("event").selectAll().limit(take), cursor)
    const events = await query.execute()

    return events.map((e) => mapToEvent(e))
  }

  async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("eventCommittee")
        .where("committeeId", "=", committeeId)
        .innerJoin("event", "event.id", "eventCommittee.eventId")
        .selectAll("event")
        .limit(take),
      cursor
    )

    const events = await query.execute()
    return events.map((e) => mapToEvent(e))
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db.selectFrom("event").where("id", "=", id).selectAll().executeTakeFirst()
    return event === undefined ? undefined : mapToEvent(event)
  }
}
