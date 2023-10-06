import { Company, Event } from "@dotkomonline/types"
import { Cursor } from "../../utils/db-utils"
import { CompanyEventRepository } from "./company-event-repository" // Note: you might need to create or rename this file based on previous changes.

export interface CompanyEventService {
  createEvent: (company: Company["id"], event: Event["id"]) => Promise<void>
  deleteEvent: (company: Company["id"], event: Event["id"]) => Promise<void>
  getEventsByCompanyId: (company: Company["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  constructor(private readonly companyEventRepository: CompanyEventRepository) {}

  async createEvent(company: Company["id"], event: Event["id"]) {
    try {
      const events = await this.companyEventRepository.createEvent(company, event)
      return events
    } catch (err) {
      throw new Error("Failed to add event to company")
    }
  }

  async deleteEvent(company: Company["id"], event: Event["id"]) {
    await this.companyEventRepository.deleteEvent(company, event)
  }

  async getEventsByCompanyId(company: Company["id"], take: number, cursor?: Cursor) {
    return await this.companyEventRepository.getEventsByCompanyId(company, take, cursor)
  }
}
