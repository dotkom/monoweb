import { Committee, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Database } from "@dotkomonline/db"
import { mapToCommittee } from "../committee/committee-repository"
import { mapToEvent } from "./event-repository"
import { Cursor, paginateQuery } from "../../utils/db-utils"

export interface EventCommitteeRepository {
  createCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  deleteCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  getCommittesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Committee[]>
  getEventsByCommitteeId: (id: Committee["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class EventCommitteeRepositoryImpl implements EventCommitteeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createCommittee(id: Event["id"], committee: Committee["id"]) {
    await this.db
      .insertInto("eventCommittee")
      .values({
        eventId: id,
        committeeId: committee,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async deleteCommittee(id: Event["id"], committee: Committee["id"]) {
    await this.db
      .deleteFrom("eventCommittee")
      .where("committeeId", "=", committee)
      .where("eventId", "=", id)
      .returningAll()
      .executeTakeFirst()
  }

  async getCommittesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
    let query = this.db
      .selectFrom("eventCommittee")
      .where("eventId", "=", id)
      .innerJoin("committee", "committee.id", "eventCommittee.committeeId")
      .selectAll("committee")
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

  async getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    let query = this.db
      .selectFrom("event")
      .leftJoin("eventCommittee", "eventCommittee.eventId", "event.id")
      .selectAll("event")
      .where("eventCommittee.committeeId", "=", committeeId)
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map(mapToEvent)
  }
}
