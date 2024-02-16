import { type Database } from "@dotkomonline/db"
import { type Event, type EventId, EventSchema } from "@dotkomonline/types"
import { type Insertable, type Kysely, type Selectable } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export type EventInsert = Insertable<Database["event"]>

export interface EventRepository {
  create(data: EventInsert): Promise<Event>
  update(id: EventId, data: EventInsert): Promise<Event>
  getAll(take: number, cursor?: Cursor): Promise<Event[]>
  getAllOrderedByDate(ascending: boolean, take: number, cursor?: Cursor): Promise<Event[]>
  getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  getById(id: string): Promise<Event | undefined>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: EventInsert): Promise<Event> {
    const event = await this.db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  }

  async update(id: EventId, data: EventInsert): Promise<Event> {
    const event = await this.db
      .updateTable("event")
      .set({ ...data, updatedAt: new Date() })
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

  async getAllOrderedByDate(ascending: boolean, take: number) {
    const query = this.db
      .selectFrom("event")
      .selectAll()
      .orderBy("start", ascending ? "asc" : "desc")
      .limit(take)

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
