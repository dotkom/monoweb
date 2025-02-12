import { z } from 'zod';

/////////////////////////////////////////
// JOB LISTING LOCATION LINK SCHEMA
/////////////////////////////////////////

export const JobListingLocationLinkSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  jobListingId: z.string(),
  locationId: z.string(),
})

export type JobListingLocationLink = z.infer<typeof JobListingLocationLinkSchema>

export default JobListingLocationLinkSchema;
