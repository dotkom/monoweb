import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, Event, EventId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface CompanyEventRepository {
  getEventsByCompanyId(handle: DBHandle, companyId: CompanyId, page: Pageable): Promise<Event[]>
  getCompaniesByEventId(handle: DBHandle, eventId: EventId): Promise<Company[]>
}

export function getCompanyEventRepository(): CompanyEventRepository {
  return {
    async getEventsByCompanyId(handle, companyId, page) {
      return await handle.event.findMany({ where: { companies: { some: { companyId } } }, ...pageQuery(page) })
    },
    async getCompaniesByEventId(handle, eventId) {
      return await handle.company.findMany({ where: { events: { some: { eventId } } } })
    },
  }
}
