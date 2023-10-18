import { Database } from "@dotkomonline/db"
import { CompanyId, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Cursor, orderedQuery } from "../../utils/db-utils"
import { mapToEvent } from "../event/event-repository"

export interface CompanyEventRepository {
  getEventsByCompanyId: (company: CompanyId, take: number, cursor?: Cursor) => Promise<Event[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getEventsByCompanyId(company: CompanyId, take: number, cursor?: Cursor) {
    const query = orderedQuery(
      this.db
        .selectFrom("eventCompany")
        .where("companyId", "=", company)
        .innerJoin("event", "event.id", "eventCompany.eventId")
        .selectAll("event")
        .limit(take),
      cursor
    )
    const events = await query.execute()
    return events.map(mapToEvent)
  }
}
