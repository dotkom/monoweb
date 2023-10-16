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
    // Fetch all committees associated with the event
    const eventCommittees = await this.committeeOrganizerRepository.getAllEventCommittees(eventId)
    const currentCommitteeIds = eventCommittees.map((committee) => committee.committeeId)

    // Identify committees to add and remove
    const committeesToRemove = currentCommitteeIds.filter((committeeId) => !committees.includes(committeeId))
    const committeesToAdd = committees.filter((committeeId) => !currentCommitteeIds.includes(committeeId))

    // Create promises for removal and addition operations
    const removePromises = committeesToRemove.map((committeeId) =>
      this.committeeOrganizerRepository.removeCommitteFromEvent(eventId, committeeId)
    )
    const addPromises = committeesToAdd.map((committeeId) =>
      this.committeeOrganizerRepository.addCommitteeToEvent(eventId, committeeId)
    )

    // Execute all promises in parallel
    await Promise.all([...removePromises, ...addPromises])
  }
}
