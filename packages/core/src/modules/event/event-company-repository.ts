import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface EventCompanyRepository {
  createCompany(handle: DBHandle, eventId: EventId, companyId: CompanyId): Promise<void>
  deleteCompany(handle: DBHandle, eventId: EventId, companyId: CompanyId): Promise<void>
  getCompaniesByEventId(handle: DBHandle, eventId: EventId): Promise<Company[]>
  getEventsByCompanyId(handle: DBHandle, companyId: CompanyId, page: Pageable): Promise<Event[]>
}

export function getEventCompanyRepository(): EventCompanyRepository {
  return {
    async createCompany(handle, eventId, companyId) {
      await handle.eventCompany.create({ data: { eventId, companyId } })
    },
    async deleteCompany(handle, eventId, companyId) {
      await handle.eventCompany.delete({ where: { eventId_companyId: { eventId, companyId } } })
    },
    async getCompaniesByEventId(handle, eventId) {
      const eventCompanies = await handle.eventCompany.findMany({ where: { eventId }, include: { company: true } })
      return eventCompanies.map((eventCompany) => eventCompany.company)
    },
    async getEventsByCompanyId(handle, companyId, page) {
      return await handle.event.findMany({
        where: {
          companies: { some: { companyId } },
        },
        ...pageQuery(page),
      })
    },
  }
}
