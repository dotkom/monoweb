import { Committee, Event, EventCommittee } from "@dotkomonline/types"
import { EventCommitteeRepositoryImpl } from "./event-committee-repository"

export interface EventCommitteeService {
  getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]>
}

export class EventCommitteeServiceImpl implements EventCommitteeService {
  constructor(private readonly committeeOrganizerRepository: EventCommitteeRepositoryImpl) {}

  async getCommitteesForEvent(eventId: Event["id"]): Promise<Committee[]> {
    const committees = await this.committeeOrganizerRepository.getAllCommittees(eventId)
    return committees
  }

  async getEventCommitteesForEvent(eventId: Event["id"]): Promise<EventCommittee[]> {
    const eventCommittees = await this.committeeOrganizerRepository.getAllEventCommittees(eventId)
    return eventCommittees
  }

  async setEventCommittees(eventId: Event["id"], committees: Committee["id"][]): Promise<void> {
    // get all committees for event
    const eventCommittees = await this.committeeOrganizerRepository.getAllEventCommittees(eventId)

    const eventCommitteeIds = eventCommittees.map((c) => c.committeeId)

    // compute diff
    const committeesToRemove = eventCommitteeIds.filter((committee) => !committees.map((c) => c).includes(committee))

    const committeesToAdd = committees.filter((committee) => !eventCommitteeIds.map((c) => c).includes(committee))

    // remove committees for event
    const removedCommittees = committeesToRemove.map((c) =>
      this.committeeOrganizerRepository.removeCommitteFromEvent(eventId, c)
    )

    // add committees for event
    const addedCommittees = committeesToAdd.map((c) =>
      this.committeeOrganizerRepository.addCommitteeToEvent(eventId, c)
    )

    await Promise.all([...removedCommittees, ...addedCommittees])
  }
}
