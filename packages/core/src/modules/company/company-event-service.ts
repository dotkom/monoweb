import type { CompanyId, Event } from "@dotkomonline/types"
import type { Cursor } from "../../utils/cursor-pagination/deprecated-pagination"
import type { CompanyEventRepository } from "./company-event-repository" // Note: you might need to create or rename this file based on previous changes.

export interface CompanyEventService {
  getEventsByCompanyId(companyId: CompanyId, take: number, cursor?: Cursor): Promise<Event[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  constructor(private readonly companyEventRepository: CompanyEventRepository) {}

  async getEventsByCompanyId(company: CompanyId, take: number, cursor?: Cursor): Promise<Event[]> {
    return this.companyEventRepository.getEventsByCompanyId(company, take, cursor)
  }
}
