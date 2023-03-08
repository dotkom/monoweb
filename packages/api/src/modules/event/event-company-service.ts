import { Company, Event } from "@dotkomonline/types"
import { EventCompanyRepository } from "./event-company-repository"
import { Cursor } from "../../utils/db-utils"

export interface EventCompanyService {
  addCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  getCompaniesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Company[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  constructor(private readonly eventCompanyRepository: EventCompanyRepository) {}

  async addCompany(id: Event["id"], company: Company["id"]) {
    try {
      const companies = await this.eventCompanyRepository.addCompany(id, company)
      return companies
    } catch (err) {
      throw new Error("Failed to add company to event")
    }
  }

  async deleteCompany(id: Event["id"], company: Company["id"]) {
    await this.eventCompanyRepository.deleteCompany(id, company)
  }

  async getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
    return await this.eventCompanyRepository.getCompaniesByEventId(id, take, cursor)
  }
}
