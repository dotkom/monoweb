import type { Company, CompanyId, EventId } from "@dotkomonline/types"
import type { EventCompanyRepository } from "./event-company-repository"

export interface EventCompanyService {
  createCompany(id: EventId, company: CompanyId): Promise<void>
  deleteCompany(id: EventId, company: CompanyId): Promise<void>
  getCompaniesByEventId(id: EventId): Promise<Company[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  private readonly eventCompanyRepository: EventCompanyRepository

  constructor(eventCompanyRepository: EventCompanyRepository) {
    this.eventCompanyRepository = eventCompanyRepository
  }

  async createCompany(id: EventId, company: CompanyId) {
    const companies = await this.eventCompanyRepository.createCompany(id, company)
    return companies
  }

  async deleteCompany(id: EventId, company: CompanyId) {
    await this.eventCompanyRepository.deleteCompany(id, company)
  }

  async getCompaniesByEventId(id: EventId) {
    return await this.eventCompanyRepository.getCompaniesByEventId(id)
  }
}
