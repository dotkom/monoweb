import { z } from "zod"

export const attendanceSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  start: z.date(),
  end: z.date(),
  deregisterDeadline: z.date(),
  limit: z.number(),
})

export type Attendance = z.infer<typeof attendanceSchema>
export type InsertAttendance = Omit<Attendance, "id">
