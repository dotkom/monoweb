import { Database } from "@dotkomonline/db"
import { Company, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Cursor, paginateQuery } from "../../utils/db-utils"
import { mapToEvent } from "../event/event-repository"

export interface CompanyEventRepository {
  getEventsByCompanyId: (company: Company["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  constructor(private readonly db: Kysely<Database>) {}
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