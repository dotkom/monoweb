import { type Committee, type Event, type EventCommittee } from "@dotkomonline/types"
import { type EventCommitteeRepositoryImpl } from "./event-committee-repository"

export interface EventCommitteeService {
  getCommitteesForEvent: (eventId: Event["id"]) => Promise<Committee[]>
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

    // compute diff
    const committeesToRemove = eventCommittees.filter((committee) => !committees.includes(committee.committeeId))
    const committeesToAdd = committees.filter(
      (committee) => !eventCommittees.map((c) => c.committeeId).includes(committee)
    )

    // remove committees for event
    const removedCommittees = committeesToRemove.map(async (c) =>
      this.committeeOrganizerRepository.removeCommitteesFromEvent(c.eventId)
    )

    // add committees for event
    const addedCommittees = committeesToAdd.map(async (c) =>
      this.committeeOrganizerRepository.addCommitteeToEvent(eventId, c)
    )

    await Promise.all([...removedCommittees, ...addedCommittees])
  }
}
