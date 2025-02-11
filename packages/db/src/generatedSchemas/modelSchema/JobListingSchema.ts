import { z } from 'zod';

/////////////////////////////////////////
// JOB LISTING SCHEMA
/////////////////////////////////////////

export const JobListingSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  companyId: z.string(),
  title: z.string(),
  ingress: z.string(),
  description: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  featured: z.boolean(),
  deadline: z.coerce.date().nullable(),
  employment: z.string(),
  applicationLink: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  deadlineAsap: z.boolean(),
})

export type JobListing = z.infer<typeof JobListingSchema>

export default JobListingSchema;
