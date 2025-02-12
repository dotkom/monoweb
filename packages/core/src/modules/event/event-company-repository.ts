import type { DBClient } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"

export interface EventCompanyRepository {
  createCompany(id: EventId, company: CompanyId): Promise<void>
  deleteCompany(id: EventId, company: CompanyId): Promise<void>
  getCompaniesByEventId(id: EventId, take: number): Promise<Company[]>
  getEventsByCompanyId(id: CompanyId, take: number): Promise<Event[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  constructor(private readonly db: DBClient) {}

  async createCompany(eventId: EventId, companyId: CompanyId) {
    await this.db.eventCompany.create({ data: { eventId, companyId } })
  }

  async deleteCompany(eventId: EventId, companyId: CompanyId) {
    await this.db.eventCompany.delete({ where: { eventId_companyId: { eventId, companyId } } })
  }

  async getCompaniesByEventId(eventId: EventId, take: number) {
    const eventCompanies = await this.db.eventCompany.findMany({ where: { eventId }, take, include: { company: true } })

    return eventCompanies.map((eventCompany) => eventCompany.company)
  }

  async getEventsByCompanyId(companyId: string, take: number): Promise<Event[]> {
    return await this.db.event.findMany({ take, where: { companies: { some: { companyId } } } })
  }
}
