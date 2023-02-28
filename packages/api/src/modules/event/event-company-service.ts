import { Company, Event } from "@dotkomonline/types"
import { EventCompanyRepository } from "./event-company-repository"

export interface EventCompanyService {
  addCompany: (id: Event["id"], company: Company["id"]) => Promise<Company[]>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<Company[]>
  getCompaniesByEventId: (id: Event["id"]) => Promise<Company[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  constructor(private readonly eventCompanyRepository: EventCompanyRepository) {}

  async addCompany(id: Event["id"], company: Company["id"]) {
    const companies = await this.eventCompanyRepository.addCompany(id, company)
    if (!companies) {
      throw new Error("Failed to add company to event")
    }
    return companies
  }

  async deleteCompany(id: Event["id"], company: Company["id"]) {
    const companies = await this.eventCompanyRepository.deleteCompany(id, company)
    if (!companies) {
      return await this.getCompaniesByEventId(id)
    }
    return companies
  }

  async getCompaniesByEventId(id: Event["id"]) {
    return await this.eventCompanyRepository.getCompaniesByEventId(id)
  }
}
