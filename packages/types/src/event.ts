import { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

import { type Attendance, AttendanceSchema } from "./attendance/attendance"
import { CompanySchema, type Company } from "./company"
import { GroupSchema, type Group } from "./group"
import { InterestGroupSchema, type InterestGroup } from "./interest-group"

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

export const EventDetailSchema = z.object({
  event: EventSchema,
  hostingCompanies: z.array(CompanySchema),
  hostingGroups: z.array(GroupSchema),
  hostingInterestGroups: z.array(InterestGroupSchema),
  attendance: AttendanceSchema.nullable(),
})

export type EventDetail = z.infer<typeof EventDetailSchema>

export const EventFilterSchema = z.object({
  query: z.string().optional(),
  before: z.date().optional(),
  after: z.date().optional(),
})
export type EventFilter = z.infer<typeof EventFilterSchema>
