import { Cursor, paginateQuery } from "../../utils/db-utils"
import { Kysely, Selectable } from "kysely"

import { Database } from "@dotkomonline/db"
import { CommiteeOrganizerSchema, CommitteeOrganizer } from "../../../../types/src/committee-event-organizer"
import { Committee, Event } from "@dotkomonline/types"
import { mapToCommittee } from "../committee/committee-repository"

export const mapToCommitteeOrganizer = (payload: Selectable<Database["committeeOrganizer"]>): CommitteeOrganizer => {
  return CommiteeOrganizerSchema.parse(payload)
}

export interface CommitteeOrganizerRepository {
  getAllCommitteesByEventId(eventId: Event["id"], take: number, cursor?: Cursor): Promise<Committee[]>
  // addToEvent(eventId: Event["id"], committeeId: Committee["id"]): Promise<CommitteeOrganizer>
  // removeFromEvent(eventId: Event["id"], committeeId: Committee["id"]): Promise<CommitteeOrganizer>
}

export class CommitteeOrganizerRepositoryImpl implements CommitteeOrganizerRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAllCommitteesByEventId(eventId: Event["id"]): Promise<Committee[]> {
    let query = this.db
      .selectFrom("committee")
      .leftJoin("committeeOrganizer", "committeeOrganizer.committeeId", "committee.id")
      .selectAll("committee")
      .where("eventId", "=", eventId)

    const committees = await query.execute()
    return committees.map(mapToCommittee)
  }
}
