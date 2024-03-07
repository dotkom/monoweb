import { z } from "zod"

export const YearCriteriaSchema = z.array(z.number())

export const AttendancePoolSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  limit: z.number(),
  attendanceId: z.string().ulid(),
  yearCriteria: YearCriteriaSchema,
  numAttendees: z.number(),
})

export const AttendancePoolWriteSchema = AttendancePoolSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  numAttendees: true,
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export type AttendancePoolId = AttendancePool["id"]
