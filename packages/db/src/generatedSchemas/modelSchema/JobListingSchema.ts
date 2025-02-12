import { z } from 'zod';
import { EmploymentTypeSchema } from '../inputTypeSchemas/EmploymentTypeSchema'

/////////////////////////////////////////
// JOB LISTING SCHEMA
/////////////////////////////////////////

export const JobListingSchema = z.object({
  employment: EmploymentTypeSchema,
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
  applicationLink: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  deadlineAsap: z.boolean(),
})

export type JobListing = z.infer<typeof JobListingSchema>

export default JobListingSchema;
