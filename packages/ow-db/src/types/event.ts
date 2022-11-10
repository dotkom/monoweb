import { Generated } from "kysely"

import { Timestamp } from "./common"

type EventStatus = "tba" | "open"

export interface EventTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  title: string
  start: Timestamp
  end: Timestamp
  status: EventStatus
  public: boolean
  description: string | null
  subtitle: string | null
  imageUrl: string | null
  location: string | null
  committee_id: string | null
}

export interface AttendanceTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  start: Timestamp
  end: Timestamp
  deregisterDeadline: Timestamp
  limit: number
  eventID: string
}

export interface AttendeeTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  userID: string
  attendanceID: string
}

export interface CommitteeTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  name: string
}
