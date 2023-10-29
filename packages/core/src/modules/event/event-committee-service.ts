import { Committee, CommitteeId, EventCommittee, EventId } from "@dotkomonline/types"
import { EventCommitteeRepositoryImpl } from "./event-committee-repository"

export interface EventCommitteeService {
  getCommitteesForEvent(eventId: EventId): Promise<Committee[]>
  getEventCommitteesForEvent(eventId: EventId): Promise<EventCommittee[]>
  setEventCommittees(eventId: EventId, committees: CommitteeId[]): Promise<EventCommittee[]>
}

export class EventCommitteeServiceImpl implements EventCommitteeService {
  constructor(private readonly committeeOrganizerRepository: EventCommitteeRepositoryImpl) {}

  async getCommitteesForEvent(eventId: EventId): Promise<Committee[]> {
    const committees = await this.committeeOrganizerRepository.getAllCommittees(eventId)
    return committees
  }

  async getEventCommitteesForEvent(eventId: EventId): Promise<EventCommittee[]> {
    const eventCommittees = await this.committeeOrganizerRepository.getAllEventCommittees(eventId)
    return eventCommittees
  }

  async setEventCommittees(eventId: EventId, committees: CommitteeId[]): Promise<EventCommittee[]> {
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

    // After removal and addition, we can identify the remaining committees
    const remainingCommittees = currentCommitteeIds
      .filter((committeeId) => !committeesToRemove.includes(committeeId)) // Remove the committees to remove
      .concat(committeesToAdd) // Add the committees to add

    return remainingCommittees.map((committeeId) => ({
      eventId,
      committeeId,
    }))
  }
}
