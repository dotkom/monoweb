import type { Company, CompanyId, EventId } from "@dotkomonline/types"
import type { EventCompanyRepository } from "./event-company-repository"

export interface EventCompanyService {
  createCompany(eventId: EventId, companyId: CompanyId): Promise<void>
  deleteCompany(eventId: EventId, companyId: CompanyId): Promise<void>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  private readonly eventCompanyRepository: EventCompanyRepository

  constructor(eventCompanyRepository: EventCompanyRepository) {
    this.eventCompanyRepository = eventCompanyRepository
  }

  public async createCompany(eventId: EventId, companyId: CompanyId) {
    const companies = await this.eventCompanyRepository.createCompany(eventId, companyId)
    return companies
  }

  public async deleteCompany(eventId: EventId, companyId: CompanyId) {
    await this.eventCompanyRepository.deleteCompany(eventId, companyId)
  }

  public async getCompaniesByEventId(eventId: EventId) {
    return await this.eventCompanyRepository.getCompaniesByEventId(eventId)
  }
}
