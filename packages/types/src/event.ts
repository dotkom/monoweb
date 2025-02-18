import type { z } from "zod"

import { schemas } from "@dotkomonline/db"

import { type Attendance, AttendanceSchema } from "./attendance/attendance"
import type { AttendancePool } from "./attendance/attendance-pool"
import type { Committee } from "./committee"
import type { Company } from "./company"

export const EventSchema = schemas.EventSchema.extend({})

export type Event = z.infer<typeof EventSchema>
export type EventId = Event["id"]

export const EventWriteSchema = EventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventWrite = z.infer<typeof EventWriteSchema>

export const AttendanceEventSchema = EventSchema.extend({
  attendance: AttendanceSchema,
})

export type AttendanceEvent = z.infer<typeof AttendanceEventSchema>

export type DashboardEventDetail = {
  event: Event
  eventCommittees: Committee[]
  attendance: Attendance | null
  pools: AttendancePool[] | null
  hasAttendance: boolean
}

export type WebEventDetail =
  | {
      hasAttendance: false
      event: Event
      eventCommittees: Committee[]
      eventCompanies: Company[]
    }
  | {
      hasAttendance: true
      event: Event
      eventCommittees: Committee[]
      attendance: Attendance
      pools: AttendancePool[]
      eventCompanies: Company[]
    }
