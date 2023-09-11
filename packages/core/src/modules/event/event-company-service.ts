import { Company, Event } from "@dotkomonline/types"
import { EventCompanyRepository } from "./event-company-repository"
import { Cursor } from "../../utils/db-utils"

export interface EventCompanyService {
  createCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  getCompaniesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Company[]>
  getEventsByCompanyId: (id: Company["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class EventCompanyServiceImpl implements EventCompanyService {
  constructor(private readonly eventCompanyRepository: EventCompanyRepository) {}

  async createCompany(id: Event["id"], company: Company["id"]) {
    try {
      const companies = await this.eventCompanyRepository.createCompany(id, company)
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

  async getEventsByCompanyId(companyId: Company["id"], take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventCompanyRepository.getEventsByCompanyId(companyId, take, cursor)
    return events
  }
}
