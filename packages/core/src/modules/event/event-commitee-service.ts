import { Committee, Company, Event } from "@dotkomonline/types"
import { Cursor } from "../../utils/db-utils"

export interface EventCommitteeService {
  createCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  deleteCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  getCommittesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Company[]>
  getEventsByCommitteeId: (id: Committee["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class EventCompanyServiceImpl implements EventCommitteeService {
  constructor(private readonly eventCommitteeRepository: EventCommitteeRepository) {}

  async createCommittee(id: Event["id"], committee: Committee["id"]) {
    try {
      return await this.eventCommitteeRepository.createCompany(id, committee)
    } catch (err) {
      throw new Error("Failed to add company to event")
    }
  }

  async deleteCommittee(id: Event["id"], company: Company["id"]) {
    await this.eventCommitteeRepository.deleteCompany(id, company)
  }

  async getCommittesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
    return await this.eventCommitteeRepository.getCompaniesByEventId(id, take, cursor)
  }

  async getEventsByCommitteeId(companyId: Company["id"], take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventCommitteeRepository.getEventsByCompanyId(companyId, take, cursor)
    return events
  }
}
