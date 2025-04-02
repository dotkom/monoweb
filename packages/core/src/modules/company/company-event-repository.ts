import type { DBClient } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"

export interface CompanyEventRepository {
  getEventsByCompanyId(company: CompanyId): Promise<Event[]>
  getCompaniesByEventId(event: EventId): Promise<Company[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getEventsByCompanyId(companyId: CompanyId) {
    return this.db.event.findMany({ where: { companies: { some: { companyId } } } })
  }

  async getCompaniesByEventId(eventId: EventId) {
    return this.db.company.findMany({ where: { events: { some: { eventId } } } })
  }
}
