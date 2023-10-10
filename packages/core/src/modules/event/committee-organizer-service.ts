import { Committee, Event } from "@dotkomonline/types"
import { CommitteeOrganizerRepositoryImpl } from "./committee-organizer-repository"

export interface CommitteeOrganizerService {
  getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]>
}

export class CommitteeOrganizerServiceImpl implements CommitteeOrganizerService {
  constructor(private readonly committeeOrganizerRepository: CommitteeOrganizerRepositoryImpl) {}

  async getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]> {
    const committees = await this.committeeOrganizerRepository.getAllCommitteesByEventId(eventId)
    return committees
  }
}
