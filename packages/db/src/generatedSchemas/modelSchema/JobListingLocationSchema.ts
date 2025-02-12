import { z } from 'zod';

/////////////////////////////////////////
// JOB LISTING LOCATION SCHEMA
/////////////////////////////////////////

export const JobListingLocationSchema = z.object({
  name: z.string(),
  createdAt: z.coerce.date(),
  jobListingId: z.string(),
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>

export default JobListingLocationSchema;
