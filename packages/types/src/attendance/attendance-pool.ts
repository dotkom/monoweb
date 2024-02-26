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
  attendees: z.array(AttendeeSchema).optional(),
})

export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  attendees: true,
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export type AttendancePoolId = AttendancePool["id"]
