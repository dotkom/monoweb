import { Kysely, Selectable } from "kysely"
import { Cursor } from "../../utils/db-utils"

import { Database } from "@dotkomonline/db"
import { Committee, Event, EventCommittee, EventCommitteeSchema } from "@dotkomonline/types"
import { mapToCommittee } from "../committee/committee-repository"

export const mapToEventCommitee = (payload: Selectable<Database["eventCommittee"]>): EventCommittee => {
  return EventCommitteeSchema.parse(payload)
}

export interface EventCommitteeRepository {
  getAllCommittees(eventId: Event["id"], take: number, cursor?: Cursor): Promise<EventCommittee[]>
  setCommittees(eventId: Event["id"], committees: Committee["id"][]): Promise<void>
}

export class EventCommitteeRepositoryImpl implements EventCommitteeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllCommittees(eventId: Event["id"]): Promise<EventCommittee[]> {
    let query = this.db.selectFrom("eventCommittee").where("eventId", "=", eventId).selectAll()
    const committees = await query.execute()
    return committees.map(mapToEventCommitee)
  }

  async getAllCommitteesByEventId(eventId: Event["id"]): Promise<Committee[]> {
    let query = this.db
      .selectFrom("committee")
      .leftJoin("eventCommittee", "eventCommittee.committeeId", "committee.id")
      .selectAll("committee")
      .where("eventId", "=", eventId)

    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }

  async setCommittees(eventId: Event["id"], committees: Committee["id"][]): Promise<void> {
    // remove all committees for event
    await this.db.deleteFrom("eventCommittee").where("eventId", "=", eventId).execute()

    if (committees.length === 0) return
    // add all committees for event
    const committeesToAdd = committees.map((committeeId) => ({ eventId, committeeId }))

    await this.db.insertInto("eventCommittee").values(committeesToAdd).execute()
  }
}
