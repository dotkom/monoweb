import { Database } from "@dotkomonline/db"
import { Company, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Cursor, paginateQuery } from "../../utils/db-utils"
import { mapToEvent } from "../event/event-repository"

export interface CompanyEventRepository {
  createEvent: (company: Company["id"], event: Event["id"]) => Promise<void>
  deleteEvent: (company: Company["id"], event: Event["id"]) => Promise<void>
  getEventsByCompanyId: (company: Company["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createEvent(company: Company["id"], event: Event["id"]) {
    await this.db
      .insertInto("eventCompany")
      .values({
        companyId: company,
        eventId: event,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async deleteEvent(company: Company["id"], event: Event["id"]) {
    await this.db
      .deleteFrom("eventCompany")
      .where("companyId", "=", company)
      .where("eventId", "=", event)
      .returningAll()
      .executeTakeFirst()
  }

  async getEventsByCompanyId(company: Company["id"], take: number, cursor?: Cursor) {
    let query = this.db
      .selectFrom("eventCompany")
      .where("companyId", "=", company)
      .innerJoin("event", "event.id", "eventCompany.eventId")
      .selectAll("event")
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
