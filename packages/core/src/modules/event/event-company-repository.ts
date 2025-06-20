import type { DBClient } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface EventCompanyRepository {
  createCompany(eventId: EventId, companyId: CompanyId): Promise<void>
  deleteCompany(eventId: EventId, companyId: CompanyId): Promise<void>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
  getEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<Event[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async createCompany(eventId: EventId, companyId: CompanyId) {
    await this.db.eventCompany.create({ data: { eventId, companyId } })
  }

  async deleteCompany(eventId: EventId, companyId: CompanyId) {
    await this.db.eventCompany.delete({ where: { eventId_companyId: { eventId, companyId } } })
  }

  async getCompaniesByEventId(eventId: EventId) {
    const eventCompanies = await this.db.eventCompany.findMany({ where: { eventId }, include: { company: true } })

    return eventCompanies.map((eventCompany) => eventCompany.company)
  }

  async getEventsByCompanyId(companyId: string, page: Pageable): Promise<Event[]> {
    return await this.db.event.findMany({
      where: {
        companies: { some: { companyId } },
      },
      ...pageQuery(page),
    })
  }
}
