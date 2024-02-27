import { z } from "zod"
import { AttendeeSchema } from "./attendee"

export const YearCriteriaSchema = z.array(z.number())

export const AttendancePoolSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  limit: z.number(),
  attendanceId: z.string().ulid(),
  yearCriteria: YearCriteriaSchema,
  numAttendees: z.number().optional(),
  attendees: z.array(AttendeeSchema).optional(),
})

export const AttendancePoolWithNumAttendeesSchema = AttendancePoolSchema.merge(
  z.object({
    numAttendees: z.number(),
  })
)

export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  attendees: true,
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export type AttendancePoolId = AttendancePool["id"]

export type AttendancePoolWithNumAttendees = z.infer<typeof AttendancePoolWithNumAttendeesSchema>
