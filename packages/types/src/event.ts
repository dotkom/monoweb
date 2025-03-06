import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

import { type Attendance, AttendanceSchema } from "./attendance/attendance"
import type { Company } from "./company"
import type { Group } from "./group"

export const EventSchema = schemas.EventSchema.extend({})

export type Event = z.infer<typeof EventSchema>
export type EventId = Event["id"]
export type EventWithAttendanceSummarySchema = z.infer<typeof EventSchema>

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

export type AttendanceEventDetail = {
  event: Event
  eventHostingGroups: Group[]
  eventCompanies: Company[]
  attendance: Attendance | null
}
