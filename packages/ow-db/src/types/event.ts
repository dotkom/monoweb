import { Generated } from "kysely"

type EventStatus = "TBA" | "PUBLIC" | "NO_LIMIT" | "ATTENDANCE"

export interface EventTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  title: string
  start: Date
  end: Date
  status: EventStatus
  type: string
  public: boolean
  description: string | null
  subtitle: string | null
  imageUrl: string | null
  location: string | null
  committeeId: string | null
}

export interface AttendanceTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  start: Date
  end: Date
  deregisterDeadline: Date
  limit: number
  eventId: string
}

export interface AttendeeTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  userId: string
  attendanceId: string
}

export interface CommitteeTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  name: string
}
