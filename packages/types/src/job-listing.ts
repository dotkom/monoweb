import { schemas } from "@dotkomonline/db"
import { z } from "zod"
import { CompanySchema } from "./company"

export const JobListingLocationSchema = schemas.JobListingLocationSchema.extend({})
export const JobListingLocationWriteSchema = JobListingLocationSchema.omit({
  createdAt: true,
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>
export type JobListingLocationId = JobListingLocation["name"]
export type JobListingLocationWrite = z.infer<typeof JobListingLocationWriteSchema>

export const JobListingSchema = schemas.JobListingSchema.omit({
  companyId: true,
}).extend({
  company: CompanySchema,
  locations: z.array(z.string()),
})

export const JobListingWriteSchema = JobListingSchema.omit({
  id: true,
  createdAt: true,
  company: true,
}).extend({
  companyId: z.string().uuid(),
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>
