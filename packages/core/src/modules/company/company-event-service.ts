import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { CompanyEventRepository } from "./company-event-repository"

export interface CompanyEventService {
  getEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<Event[]>
  getCompaniesByEventId(eventId: EventId): Promise<Company[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  private readonly companyEventRepository: CompanyEventRepository

  constructor(companyEventRepository: CompanyEventRepository) {
    this.companyEventRepository = companyEventRepository
  }

  async getEventsByCompanyId(companyId: CompanyId, page: Pageable): Promise<Event[]> {
    return this.companyEventRepository.getEventsByCompanyId(companyId, page)
  }

  async getCompaniesByEventId(eventId: EventId): Promise<Company[]> {
    return this.companyEventRepository.getCompaniesByEventId(eventId)
  }
}
