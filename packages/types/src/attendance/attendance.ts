import { z } from "zod"

export const AttendanceSchema = z.object({
  id: z.string().ulid(),
  registerStart: z.date(),
  registerEnd: z.date(),
  deregisterDeadline: z.date(),
  mergeTime: z.date(),
  eventId: z.string().ulid(),
})

export const AttendanceWriteSchema = AttendanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendanceId = Attendance["id"]
