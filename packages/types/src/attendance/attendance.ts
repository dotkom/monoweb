import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { AttendancePoolSchema } from "./attendance-pool"
import { AttendanceSelectionSchema } from "./attendance-selections"

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceId = Attendance["id"]
export const AttendanceSchema = schemas.AttendanceSchema.extend({
  pools: z.array(AttendancePoolSchema),
  selections: z.array(AttendanceSelectionSchema),
})

export const AttendanceWriteSchema = AttendanceSchema.pick({
  registerStart: true,
  registerEnd: true,
  deregisterDeadline: true,
  selections: true,
  attendancePrice: true,
})

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>

// TODO: Where on earth does this come from?
export type AttendanceStatus = "NotOpened" | "Open" | "Closed"

export function canRegisterForAttendance(attendance: Attendance, atTime = new Date()) {
  return attendance.registerEnd > atTime && atTime > attendance.registerStart
}

export function canDeregisterForAttendance(attendance: Attendance, atTime = new Date()) {
  return attendance.deregisterDeadline > atTime
}
