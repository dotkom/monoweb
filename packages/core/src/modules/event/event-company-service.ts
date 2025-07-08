import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, EventId } from "@dotkomonline/types"
import type { EventCompanyRepository } from "./event-company-repository"

export interface EventCompanyService {
  createCompany(handle: DBHandle, eventId: EventId, companyId: CompanyId): Promise<void>
  deleteCompany(handle: DBHandle, eventId: EventId, companyId: CompanyId): Promise<void>
  getCompaniesByEventId(handle: DBHandle, eventId: EventId): Promise<Company[]>
}

export function getEventCompanyService(eventCompanyRepository: EventCompanyRepository): EventCompanyService {
  return {
    async createCompany(handle, eventId, companyId) {
      return await eventCompanyRepository.createCompany(handle, eventId, companyId)
    },
    async deleteCompany(handle, eventId, companyId) {
      return await eventCompanyRepository.deleteCompany(handle, eventId, companyId)
    },
    async getCompaniesByEventId(handle, eventId) {
      return await eventCompanyRepository.getCompaniesByEventId(handle, eventId)
    },
  }
}
