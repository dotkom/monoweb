import type { CompanyId, Event } from "@dotkomonline/types"
import type { Cursor } from "../../query"
import type { CompanyEventRepository } from "./company-event-repository" // Note: you might need to create or rename this file based on previous changes.

export interface CompanyEventService {
  getEventsByCompanyId(companyId: CompanyId, take: number, cursor?: Cursor): Promise<Event[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  private readonly companyEventRepository: CompanyEventRepository

  constructor(companyEventRepository: CompanyEventRepository) {
    this.companyEventRepository = companyEventRepository
  }

  async getEventsByCompanyId(company: CompanyId): Promise<Event[]> {
    return this.companyEventRepository.getEventsByCompanyId(company)
  }
}
