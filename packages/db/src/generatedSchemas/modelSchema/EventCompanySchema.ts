import { z } from 'zod';

/////////////////////////////////////////
// EVENT COMPANY SCHEMA
/////////////////////////////////////////

export const EventCompanySchema = z.object({
  eventId: z.string(),
  companyId: z.string(),
})

export type EventCompany = z.infer<typeof EventCompanySchema>

export default EventCompanySchema;
