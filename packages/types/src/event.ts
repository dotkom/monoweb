import { z } from "zod"

export const EventSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  start: z.date(),
  end: z.date(),
  status: z.enum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
  type: z.string(), // TODO:
  public: z.boolean(),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  committeeID: z.string().optional(),
})

export type Event = z.infer<typeof EventSchema>

export const EventWriteSchema = EventSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventWrite = z.infer<typeof EventWriteSchema>

export const AttendeeSchema = z.object({
  attendanceID: z.string(),
  userID: z.string(),
})

export const AttendanceSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  start: z.date(),
  end: z.date(),
  deregisterDeadline: z.date(),
  limit: z.number(),
  eventID: z.string(),
  attendees: z.array(AttendeeSchema),
})

export type Attendance = z.infer<typeof AttendanceSchema>

export const AttendanceWriteSchema = AttendanceSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type WriteAttendance = z.infer<typeof EventSchema>
