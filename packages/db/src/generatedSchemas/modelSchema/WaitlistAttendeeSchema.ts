import { z } from 'zod';

/////////////////////////////////////////
// WAITLIST ATTENDEE SCHEMA
/////////////////////////////////////////

export const WaitlistAttendeeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attendanceId: z.string().nullable(),
  userId: z.string().nullable(),
  position: z.number().int().nullable(),
  isPunished: z.boolean().nullable(),
  registeredAt: z.coerce.date().nullable(),
  studyYear: z.number().int(),
  attendancePoolId: z.string().nullable(),
  name: z.string(),
})

export type WaitlistAttendee = z.infer<typeof WaitlistAttendeeSchema>

export default WaitlistAttendeeSchema;
