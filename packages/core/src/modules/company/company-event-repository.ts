import type { Database } from "@dotkomonline/db"
import type { CompanyId, Event } from "@dotkomonline/types"
import type { Kysely } from "kysely"
import type { Cursor } from "../../utils/cursor-pagination/deprecated-pagination"
import { orderedQuery } from "../../utils/cursor-pagination/deprecated-pagination"
import { mapToEvent } from "../event/event-repository"

export interface CompanyEventRepository {
  getEventsByCompanyId(company: CompanyId, take: number, cursor?: Cursor): Promise<Event[]>
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
