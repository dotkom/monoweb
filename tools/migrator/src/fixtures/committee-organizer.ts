import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"
import { type InsertedIds } from "../fixture"

export const getEventCommitteeFixtures: (
  eventIds: InsertedIds["event"],
  committeeIds: InsertedIds["committee"]
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
