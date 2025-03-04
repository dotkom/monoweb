import type { DBClient } from "@dotkomonline/db"
import type { CompanyId, Event } from "@dotkomonline/types"

export interface CompanyEventRepository {
  getEventsByCompanyId(company: CompanyId): Promise<Event[]>
}

export class CompanyEventRepositoryImpl implements CompanyEventRepository {
  constructor(private readonly db: DBClient) {}

  async getEventsByCompanyId(companyId: CompanyId) {
    return this.db.event.findMany({ where: { companies: { some: { companyId } } } })
  }
}
