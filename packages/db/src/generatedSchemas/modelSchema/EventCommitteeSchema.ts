import { z } from 'zod';

/////////////////////////////////////////
// EVENT COMMITTEE SCHEMA
/////////////////////////////////////////

export const EventCommitteeSchema = z.object({
  committeeId: z.string(),
  eventId: z.string(),
})

export type EventCommittee = z.infer<typeof EventCommitteeSchema>

export default EventCommitteeSchema;
