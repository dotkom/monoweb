import { Generated } from "kysely"

export interface CommitteeTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  name: string
  description: string
  email: string | null
  image: string | null
}

export interface EventCommitteeTable {
  eventId: string
  committeeId: string
}
