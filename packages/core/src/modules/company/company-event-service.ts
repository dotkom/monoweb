import { Company, Event } from "@dotkomonline/types"
import { Cursor } from "../../utils/db-utils"
import { CompanyEventRepository } from "./company-event-repository" // Note: you might need to create or rename this file based on previous changes.

export interface CompanyEventService {
  getEventsByCompanyId(companyId: Company["id"], take: number, cursor?: Cursor): Promise<Event[]>
}

export class CompanyEventServiceImpl implements CompanyEventService {
  constructor(private readonly companyEventRepository: CompanyEventRepository) {}

  async getEventsByCompanyId(company: Company["id"], take: number, cursor?: Cursor): Promise<Event[]> {
    return this.companyEventRepository.getEventsByCompanyId(company, take, cursor)
  }
}
