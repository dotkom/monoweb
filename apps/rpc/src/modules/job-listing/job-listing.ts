import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { z } from "zod"
import { CompanySchema } from "../company/company"

export const EmploymentTypeSchema = z.enum(["PARTTIME", "FULLTIME", "SUMMER_INTERNSHIP", "OTHER"])

export const JobListingLocationSchema = z.object({
  name: z.string(),
  createdAt: z.date(),
  jobListingId: z.string(),
})
export const JobListingLocationWriteSchema = JobListingLocationSchema.omit({
  createdAt: true,
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>
export type JobListingLocationId = JobListingLocation["name"]
export type JobListingLocationWrite = z.infer<typeof JobListingLocationWriteSchema>

export const JobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  shortDescription: z.string().nullable(),
  start: z.date(),
  end: z.date(),
  featured: z.boolean(),
  hidden: z.boolean(),
  deadline: z.date().nullable(),
  employment: EmploymentTypeSchema,
  applicationLink: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  rollingAdmission: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
  updatedAt: true,
  company: true,
  locations: true,
  shortDescription: true,
})

export type JobListing = z.infer<typeof JobListingSchema>
export type JobListingId = JobListing["id"]
export type JobListingEmployment = JobListing["employment"]
export type JobListingWrite = z.infer<typeof JobListingWriteSchema>

export const getJobListingEmploymentName = (type: JobListingEmployment) => {
  switch (type) {
    case "FULLTIME":
      return "Fulltid"
    case "PARTTIME":
      return "Deltid"
    case "SUMMER_INTERNSHIP":
      return "Sommerjobb"
    case "OTHER":
      return "Annet"
    default:
      return "Ukjent type"
  }
}

export type JobListingFilterQuery = z.infer<typeof JobListingFilterQuerySchema>
export const JobListingFilterQuerySchema = z
  .object({
    byId: buildAnyOfFilter(JobListingSchema.shape.id),
    byStartDate: buildDateRangeFilter(),
    byEndDate: buildDateRangeFilter(),
    bySearchTerm: buildSearchFilter(),
    byCompany: buildAnyOfFilter(CompanySchema.shape.id),
    orderBy: createSortOrder(),
  })
  .partial()
