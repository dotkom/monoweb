import { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

import { type Attendance, AttendanceSchema } from "./attendance/attendance"
import type { Company } from "./company"
import type { Group } from "./group"
import type { InterestGroup } from "./interest-group"

export const EventSchema = schemas.EventSchema.extend({})

export type Event = z.infer<typeof EventSchema>
export type EventId = Event["id"]
export type EventWithAttendanceSummarySchema = z.infer<typeof EventSchema>

export type EventType = schemas.EventTypeType

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
  companies: Company[]
  eventHostingGroups: Group[]
  eventInterestGroups: InterestGroup[]
  attendance: Attendance | null
}

export const EventFilterSchema = z.object({
  query: z.string().optional(),
  before: z.date().optional(),
  after: z.date().optional(),
})
export type EventFilter = z.infer<typeof EventFilterSchema>
