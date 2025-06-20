import type { DBClient } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface CompanyEventRepository {
  getEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<Event[]>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<Event[]> {
    return this.db.event.findMany({ where: { companies: { some: { companyId } } }, ...pageQuery(page) })
  }

  async getCompaniesByEventId(eventId: EventId) {
    return this.db.company.findMany({ where: { events: { some: { eventId } } } })
  }
}
