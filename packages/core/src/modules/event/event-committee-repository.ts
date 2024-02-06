import { type Kysely, type Selectable } from "kysely"
import { type Database } from "@dotkomonline/db"
import {
  type Committee,
  type CommitteeId,
  type EventCommittee,
  EventCommitteeSchema,
  type EventId,
} from "@dotkomonline/types"
import { type Cursor } from "../../utils/db-utils"
import { mapToCommittee } from "../committee/committee-repository"

export const mapToEventCommitee = (payload: Selectable<Database["eventCommittee"]>): EventCommittee =>
  EventCommitteeSchema.parse(payload)

export interface EventCommitteeRepository {
  getAllEventCommittees(eventId: EventId, take: number, cursor?: Cursor): Promise<EventCommittee[]>
  getAllCommittees(eventId: EventId, take: number, cursor?: Cursor): Promise<Committee[]>
  addCommitteeToEvent(eventId: EventId, committeeId: CommitteeId): Promise<void>
  removeCommitteFromEvent(eventId: EventId, committeeId: CommitteeId): Promise<void>
}

export class EventCommitteeRepositoryImpl implements EventCommitteeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllEventCommittees(eventId: EventId): Promise<EventCommittee[]> {
    const query = this.db.selectFrom("eventCommittee").where("eventId", "=", eventId).selectAll()
    const committees = await query.execute()
    return committees.map(mapToEventCommitee)
  }

  async getAllCommittees(eventId: EventId): Promise<Committee[]> {
    const query = this.db
      .selectFrom("committee")
      .leftJoin("eventCommittee", "eventCommittee.committeeId", "committee.id")
      .selectAll("committee")
      .where("eventId", "=", eventId)

    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

  async addCommitteeToEvent(eventId: EventId, committee: CommitteeId): Promise<void> {
    const row = { eventId, committeeId: committee }
    await this.db.insertInto("eventCommittee").values(row).execute()
  }

  async removeCommitteFromEvent(eventId: EventId, committeeId: CommitteeId): Promise<void> {
    await this.db
      .deleteFrom("eventCommittee")
      .where("eventId", "=", eventId)
      .where("committeeId", "=", committeeId)
      .execute()
  }
}
