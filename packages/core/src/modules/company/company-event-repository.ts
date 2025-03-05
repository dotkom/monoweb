import type { DBClient } from "@dotkomonline/db"
import type { CompanyId, Event } from "@dotkomonline/types"

export interface CompanyEventRepository {
  getEventsByCompanyId(company: CompanyId): Promise<Event[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getEventsByCompanyId(companyId: CompanyId) {
    return this.db.event.findMany({ where: { companies: { some: { companyId } } } })
  }
}
