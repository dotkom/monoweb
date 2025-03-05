import type { DBClient } from "@dotkomonline/db"
import type { Committee, CommitteeId, EventId } from "@dotkomonline/types"

export interface EventCommitteeRepository {
  getAllEventCommittees(eventId: EventId): Promise<Committee[]>
  getAllCommittees(eventId: EventId): Promise<Committee[]>
  addCommitteeToEvent(eventId: EventId, committeeId: CommitteeId): Promise<void>
  removeCommitteFromEvent(eventId: EventId, committeeId: CommitteeId): Promise<void>
}

export class EventCommitteeRepositoryImpl implements EventCommitteeRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getAllEventCommittees(eventId: EventId): Promise<Committee[]> {
    const eventCommittees = await this.db.eventCommittee.findMany({
      where: { eventId },
      select: { committee: true },
    })

    return eventCommittees.map((eventCommitee) => eventCommitee.committee)
  }

  async getAllCommittees(eventId: EventId): Promise<Committee[]> {
    return await this.getAllEventCommittees(eventId)
  }

  async addCommitteeToEvent(eventId: EventId, committeeId: CommitteeId): Promise<void> {
    await this.db.eventCommittee.create({ data: { eventId, committeeId } })
  }

  async removeCommitteFromEvent(eventId: EventId, committeeId: CommitteeId): Promise<void> {
    await this.db.eventCommittee.delete({ where: { committeeId_eventId: { eventId, committeeId } } })
  }
}
