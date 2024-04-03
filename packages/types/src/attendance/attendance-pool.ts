import { z } from "zod"

export const YearCriteriaSchema = z.array(z.number())

export const AttendancePoolSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  capacity: z.number(),
  attendanceId: z.string().ulid(),
  yearCriteria: YearCriteriaSchema,
  numAttendees: z.number(),
  title: z.string().min(1),
  activeFrom: z.date(),
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

export const AttendancePoolBaseSchema = AttendancePoolSchema.omit({
  numAttendees: true,
})

export type AttendancePoolBase = z.infer<typeof AttendancePoolBaseSchema>
