import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// ATTENDEE SCHEMA
/////////////////////////////////////////

export const AttendeeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attendanceId: z.string(),
  userId: z.string(),
  attendancePoolId: z.string(),
  registeredAt: z.coerce.date(),
  extrasChoices: JsonValueSchema.nullable(),
  attended: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
})

export type Attendee = z.infer<typeof AttendeeSchema>

export default AttendeeSchema;
