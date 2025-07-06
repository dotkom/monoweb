import { schemas } from "@dotkomonline/db/schemas"
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
  id: z.string(),
  company: CompanySchema,
  locations: z.array(
    z.object({
      name: z.string(),
    })
  ),
})

export const JobListingWriteSchema = JobListingSchema.omit({
  id: true,
  createdAt: true,
  company: true,
  locations: true,
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>
