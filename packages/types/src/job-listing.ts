import { z } from "zod"

export const JobListingSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  companyId: z.string().nullable(),
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
  createdAt: true,
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>
