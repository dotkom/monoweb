import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import type { Cursor } from "../../query"
import type { CompanyEventRepository } from "./company-event-repository"

export interface CompanyEventService {
  getEventsByCompanyId(companyId: CompanyId, take: number, cursor?: Cursor): Promise<Event[]>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  private readonly companyEventRepository: CompanyEventRepository

  constructor(companyEventRepository: CompanyEventRepository) {
    this.companyEventRepository = companyEventRepository
  }

  async getEventsByCompanyId(company: CompanyId): Promise<Event[]> {
    return this.companyEventRepository.getEventsByCompanyId(company)
  }

  async getCompaniesByEventId(event: EventId): Promise<Company[]> {
    return this.companyEventRepository.getCompaniesByEventId(event)
  }
}
