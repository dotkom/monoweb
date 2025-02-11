import { z } from 'zod';

/////////////////////////////////////////
// JOB LISTING LOCATION SCHEMA
/////////////////////////////////////////

export const JobListingLocationSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  name: z.string(),
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>

export default JobListingLocationSchema;
