import { z } from "zod"

export const attendeeSchema = z.object({
  id: z.string().uuid(),
  attendanceId: z.string().uuid(),
  eventId: z.string().uuid(),
})

export type Attendee = z.infer<typeof attendeeSchema>
export type InsertAttendee = Omit<Attendee, "id">
