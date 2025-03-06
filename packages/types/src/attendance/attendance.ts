import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { AttendancePoolSchema } from "./attendance-pool"
import { AttendanceSelectionSchema } from "./attendance-selections"

export const AttendanceSchema = schemas.AttendanceSchema.extend({
  pools: z.array(AttendancePoolSchema),
  selections: z.array(AttendanceSelectionSchema),
})

export const AttendanceWriteSchema = AttendanceSchema.omit({
  pools: true,
  id: true,
  updatedAt: true,
  createdAt: true,
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendanceId = Attendance["id"]

export function canRegisterForAttendance(attendance: Attendance, atTime = new Date()) {
  return attendance.registerEnd > atTime && atTime > attendance.registerStart
}

export function canDeregisterForAttendance(attendance: Attendance, atTime = new Date()) {
  return attendance.deregisterDeadline > atTime
}
