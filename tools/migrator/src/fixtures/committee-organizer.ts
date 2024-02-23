import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"
import { type ResultIds } from "../fixture"

// const eventCommittees = getEventCommitteeFixtures(resultIds.event, resultIds.committee)
// export const eventCommittees: Insertable<Database["eventCommittee"]>[] = [
export const getEventCommitteeFixtures: (
  eventIds: ResultIds["event"],
  committeeIds: ResultIds["committee"]
) => Insertable<Database["eventCommittee"]>[] = (eventIds, committeeIds) => [
  {
    eventId: eventIds[0],
    committeeId: committeeIds[0],
  },
  {
    eventId: eventIds[0],
    committeeId: committeeIds[1],
  },
  {
    eventId: eventIds[1],
    committeeId: committeeIds[0],
  },
]
