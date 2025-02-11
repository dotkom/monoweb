import { z } from "zod"
import { CompanySchema } from "./company"
import { dbSchemas } from "@dotkomonline/db"

export const JobListingLocationSchema = dbSchemas.JobListingLocationSchema.extend({})
export const JobListingLocationWriteSchema = JobListingLocationSchema.omit({
  id: true,
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>
export type JobListingLocationId = JobListingLocation["id"]
export type JobListingLocationWrite = z.infer<typeof JobListingLocationWriteSchema>

export const JobListingSchema = dbSchemas.JobListingSchema.omit({
  companyId: true
}).extend({
  company: CompanySchema,
  locations: z.array(JobListingLocationSchema)
})

export const JobListingWriteSchema = JobListingSchema.omit({
  id: true,
  createdAt: true,
  company: true,
  locations: true
}).extend({
  companyId: z.string().uuid(),
  locationIds: z.array(z.string().uuid())
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>
