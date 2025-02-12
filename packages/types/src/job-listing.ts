import { z } from "zod"
import { CompanySchema } from "./company"
import { dbSchemas } from "@dotkomonline/db"

export const JobListingLocationSchema = dbSchemas.JobListingLocationSchema.extend({})
export const JobListingLocationWriteSchema = JobListingLocationSchema.omit({
  id: true,
  createdAt: true
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>
export type JobListingLocationId = JobListingLocation["id"]
export type JobListingLocationWrite = z.infer<typeof JobListingLocationWriteSchema>

export const JobListingSchema = dbSchemas.JobListingSchema.omit({
  companyId: true
}).extend({
  company: CompanySchema,
})

export const JobListingWriteSchema = JobListingSchema.omit({
  id: true,
  createdAt: true,
  company: true,
}).extend({
  companyId: z.string().uuid()
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>

export const JobListingWithLocationsSchema = JobListingSchema.extend({
  locations: z.array(z.string())
})

export const JobListingWithLocationWriteSchema = JobListingWithLocationsSchema.omit({
  id: true,
  createdAt: true,
  company: true
}).extend({
  companyId: z.string().uuid()
})

export type JobListingWithLocation = z.infer<typeof JobListingWithLocationsSchema>
export type JobListingWithLocationWrite = z.infer<typeof JobListingWithLocationWriteSchema>
