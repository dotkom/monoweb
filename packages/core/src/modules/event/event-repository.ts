import { Database } from "@dotkomonline/db"
import { DB } from "@dotkomonline/db/src/db.generated"
import { Committee, Event, EventSchema, EventWrite } from "@dotkomonline/types"
import { Kysely, Selectable, sql } from "kysely"
import { Cursor, paginateQuery } from "../../utils/db-utils"
import { mapToCommittee } from "../committee/committee-repository"

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

  async getAllEventCommittees(eventId: Event["id"]): Promise<Committee[]> {
    const query = this.db
      .selectFrom("committee")
      .leftJoin("eventCommittee", "eventCommittee.committeeId", "committee.id")
      .selectAll("committee")
      .where("eventId", "=", eventId)

    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

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
    let query = this.db
      .selectFrom("event")
      .leftJoin("eventCommittee", "eventCommittee.eventId", "event.id")
      .leftJoin("committee", "committee.id", "eventCommittee.committeeId")
      .selectAll("event")
      .select(
        sql<DB["committee"][]>`COALESCE(json_agg(committee) FILTER (WHERE committee.id IS NOT NULL), '[]')`.as(
          "committees"
        )
      )
      .groupBy("event.id")
      .limit(take)

    // selectAll().limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }
    const events = await query.execute()

    return events.map((e) => mapToEvent(e))
  }

  async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    let query = this.db
      .selectFrom("eventCommittee")
      .where("committeeId", "=", committeeId)
      .innerJoin("event", "event.id", "eventCommittee.eventId")
      .selectAll("event")
      .limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map((e) => mapToEvent(e))
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db
      .selectFrom("event")
      .leftJoin("eventCommittee", "eventCommittee.eventId", "event.id")
      .leftJoin("committee", "committee.id", "eventCommittee.committeeId")
      .selectAll("event")
      .select(
        sql<DB["committee"][]>`COALESCE(json_agg(committee) FILTER (WHERE committee.id IS NOT NULL), '[]')`.as(
          "committees"
        )
      )
      .groupBy("event.id")
      .where("event.id", "=", id)
      .executeTakeFirst()

    return event === undefined ? undefined : mapToEvent(event)
  }
}
