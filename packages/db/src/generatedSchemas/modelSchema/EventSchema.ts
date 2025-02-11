import { z } from 'zod';
import { EventStatusSchema } from '../inputTypeSchemas/EventStatusSchema'
import { EventTypeSchema } from '../inputTypeSchemas/EventTypeSchema'

/////////////////////////////////////////
// EVENT SCHEMA
/////////////////////////////////////////

export const EventSchema = z.object({
  status: EventStatusSchema,
  type: EventTypeSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  public: z.boolean(),
  description: z.string().nullable(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().nullable(),
  locationTitle: z.string(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  attendanceId: z.string().nullable(),
})

export type Event = z.infer<typeof EventSchema>

export default EventSchema;
