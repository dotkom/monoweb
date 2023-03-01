import { Generated } from "kysely"

export interface CommitteeTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  name: string
}

export interface EventCommitteeTable {
  eventId: string
  committeeId: string
}
