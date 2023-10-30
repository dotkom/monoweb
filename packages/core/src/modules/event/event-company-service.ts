import { type Company, type CompanyId, type EventId } from "@dotkomonline/types"
import { type EventCompanyRepository } from "./event-company-repository"
import { type Cursor } from "../../utils/db-utils"

export interface EventCompanyService {
  createCompany: (id: EventId, company: CompanyId) => Promise<void>
  deleteCompany: (id: EventId, company: CompanyId) => Promise<void>
  getCompaniesByEventId: (id: EventId, take: number, cursor?: Cursor) => Promise<Company[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  constructor(private readonly eventCompanyRepository: EventCompanyRepository) {}

  async createCompany(id: EventId, company: CompanyId) {
    try {
      const companies = await this.eventCompanyRepository.createCompany(id, company)
      return companies
    } catch (err) {
      throw new Error("Failed to add company to event")
    }
  }

  async deleteCompany(id: EventId, company: CompanyId) {
    await this.eventCompanyRepository.deleteCompany(id, company)
  }

  async getCompaniesByEventId(id: EventId, take: number, cursor?: Cursor) {
    return await this.eventCompanyRepository.getCompaniesByEventId(id, take, cursor)
  }
}
