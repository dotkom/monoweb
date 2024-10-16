import { z } from "zod"
import { CompanySchema } from "./company"

export const JobListingSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  company: CompanySchema.pick({ id: true, name: true, image: true }),
  title: z.string().max(1000).min(1),
  ingress: z.string().min(1),
  description: z.string().min(1),
  start: z.date(),
  end: z.date(),
  featured: z.boolean(),
  deadline: z.date().nullable(),
  employment: z.enum(["Fulltid", "Deltid", "Sommerjobb/internship", "Annet"]),
  applicationLink: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  deadlineAsap: z.boolean(),
  locations: z.array(z.string()),
})

export const JobListingWriteSchema = JobListingSchema.partial({
  id: true,
  company: true,
})
  .extend({
    companyId: z.string().ulid(),
  })
  .partial()

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>

export const JobListingLocationSchema = z.object({
  id: z.string().ulid(),
  name: z.string().min(1),
})

export const JobListingLocationWriteSchema = JobListingLocationSchema.partial({
  id: true,
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>
export type JobListingLocationId = JobListingLocation["id"]
export type JobListingLocationWrite = z.infer<typeof JobListingLocationWriteSchema>
