import { Committee, Event } from "@dotkomonline/types"
import { Cursor } from "../../utils/db-utils"
import { EventCommitteeRepository } from "./event-committee-repository.js"

export interface EventCommitteeService {
  createCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  deleteCommittee: (id: Event["id"], committee: Committee["id"]) => Promise<void>
  getCommitteeByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Committee[]>
  getEventsByCommitteeId: (id: Committee["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class EventCommitteeServiceImpl implements EventCommitteeService {
  constructor(private readonly eventCommitteeRepository: EventCommitteeRepository) {}

  async createCommittee(id: Event["id"], committee: Committee["id"]) {
    try {
      return await this.eventCommitteeRepository.createCommittee(id, committee)
    } catch (err) {
      throw new Error("Failed to add committee to event")
    }
  }

  async deleteCommittee(id: Event["id"], committee: Committee["id"]) {
    await this.eventCommitteeRepository.deleteCommittee(id, committee)
  }

  async getCommitteeByEventId(id: Event["id"], take: number, cursor?: Cursor) {
    return await this.eventCommitteeRepository.getCommittesByEventId(id, take, cursor)
  }

  async getEventsByCommitteeId(committeeId: Committee["id"], take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventCommitteeRepository.getEventsByCommitteeId(committeeId, take, cursor)
    return events
  }
}
