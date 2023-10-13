import { Committee, Event } from "@dotkomonline/types"
import { EventCommitteeRepositoryImpl } from "./event-committee-repository"

export interface EventCommitteeService {
  getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]>
}

export class EventCommitteeServiceImpl implements EventCommitteeService {
  constructor(private readonly committeeOrganizerRepository: EventCommitteeRepositoryImpl) {}

  async getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]> {
    const committees = await this.committeeOrganizerRepository.getAllCommitteesByEventId(eventId)
    return committees
  }

  async setEventCommittees(eventId: Event["id"], organizers: Committee["id"][]): Promise<void> {
    await this.committeeOrganizerRepository.setCommittees(eventId, organizers)
  }
}
