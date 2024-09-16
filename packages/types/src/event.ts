import { z } from "zod"
import { type Attendance, AttendanceSchema } from "./attendance/attendance"
import type { AttendancePool } from "./attendance/attendance-pool"
import type { Committee } from "./committee"
import type { Company } from "./company"

export const EventSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().min(1),
  start: z.date(),
  end: z.date(),
  status: z.enum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
  type: z.enum(["SOCIAL", "COMPANY", "BEDPRES", "ACADEMIC"]),
  public: z.boolean(),
  description: z.string().nullable(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  locationTitle: z.string(),
  attendanceId: z.string().nullable(),
})

export type EventId = Event["id"]
export type Event = z.infer<typeof EventSchema>

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
