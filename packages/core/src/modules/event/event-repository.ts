import { Database } from "@dotkomonline/db"
import { Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"
import { Cursor, paginateQuery } from "../../utils/db-utils"

export const mapToEvent = (data: Selectable<Database["event"]>, committeesIds?: string[]) => {
  if (!committeesIds) committeesIds = []
  let eventWithCommittees = {
    ...data,
    committeeOrganizers: committeesIds,
  }
  return EventSchema.parse(eventWithCommittees)
}

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
    const { committeeOrganizers, ...eventInsert } = data

    const event = await this.db.insertInto("event").values(eventInsert).returningAll().executeTakeFirstOrThrow()

    if (committeeOrganizers) {
      for (const committeeOrganizer of committeeOrganizers) {
        await this.db
          .insertInto("committeeOrganizer")
          .values({ eventId: event.id, committeeId: committeeOrganizer })
          .execute()
      }
    }

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
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const events = await query.execute()

    const result: Event[] = []
    for (const event of events) {
      const committeeOrganizers = await this.db
        .selectFrom("committeeOrganizer")
        .selectAll()
        .where("eventId", "=", event.id)
        .execute()

      result.push(
        mapToEvent(
          event,
          committeeOrganizers.map((co) => co.committeeId)
        )
      )
    }

    return result
  }
  async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    // let query = this.db.selectFrom("event").selectAll().where("committeeId", "=", committeeId).limit(take)

    let query = this.db
      .selectFrom("committeeOrganizer")
      .where("committeeId", "=", committeeId)
      .innerJoin("event", "event.id", "committeeOrganizer.eventId")
      .selectAll("event")
      .limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map((e) => mapToEvent(e, []))
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst()

    const committeeOrganizers = await this.db
      .selectFrom("committeeOrganizer")
      .selectAll()
      .where("eventId", "=", id)
      .execute()

    return event
      ? mapToEvent(
          event,
          committeeOrganizers.map((o) => o.committeeId)
        )
      : undefined
  }
}
