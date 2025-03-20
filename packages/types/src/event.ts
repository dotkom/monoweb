import { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

import { AttendanceDetailsSchema } from "./attendance/attendance"
import { CompanySchema } from "./company"
import { GroupSchema } from "./group"

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

export const EventWithAttendanceNumbersSchema = z.object({
  event: EventSchema,

  totalCapacity: z.number().nullable(),
  totalCapacityUsed: z.number().nullable(),
})

export type EventWithAttendeeNumbers = z.infer<typeof EventWithAttendanceNumbersSchema>

export const EventDetailsSchema = z.object({
  event: EventSchema,
  hostingGroups: z.array(GroupSchema),
  companies: z.array(CompanySchema),
  attendanceDetails: AttendanceDetailsSchema,
})
