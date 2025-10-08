import type { DBHandle } from "@dotkomonline/db"
import {
  type CompanyId,
  type JobListing,
  type JobListingFilterQuery,
  type JobListingId,
  type JobListingLocation,
  type JobListingLocationId,
  JobListingLocationSchema,
  JobListingSchema,
  type JobListingWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface JobListingRepository {
  getById(handle: DBHandle, jobListingId: JobListingId): Promise<JobListing | null>
  getAll(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  findMany(handle: DBHandle, query: JobListingFilterQuery, page: Pageable): Promise<JobListing[]>
  getActive(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  createJobListing(
    handle: DBHandle,
    data: JobListingWrite,
    companyId: CompanyId,
    locationIds: JobListingLocationId[]
  ): Promise<JobListing>
  update(
    handle: DBHandle,
    jobListingId: JobListingId,
    data: Partial<JobListingWrite>,
    companyId: CompanyId,
    locationIds: JobListingLocationId[]
  ): Promise<JobListing>
  getLocations(handle: DBHandle): Promise<JobListingLocation[]>
}

export function getJobListingRepository(): JobListingRepository {
  return {
    async createJobListing(handle, data, companyId, locationIds) {
      const listing = await handle.jobListing.create({
        data: {
          ...data,
          company: {
            connect: {
              id: companyId,
            },
          },
          locations: {
            createMany: {
              data: locationIds.map((locationId) => ({ name: locationId })),
            },
          },
        },
        include: {
          company: true,
          locations: true,
        },
      })
      return parseOrReport(JobListingSchema, listing)
    },
    async update(handle, jobListingId, data, companyId, locationIds) {
      const listing = await handle.jobListing.update({
        where: { id: jobListingId },
        data: {
          ...data,
          locations: {
            connectOrCreate: locationIds?.map((name) => ({
              create: { name },
              where: { name_jobListingId: { name, jobListingId } },
            })),
            deleteMany: {
              AND: [
                {
                  jobListingId,
                },
                {
                  name: {
                    notIn: locationIds,
                  },
                },
              ],
            },
          },
        },
        include: {
          company: true,
          locations: true,
        },
      })
      return parseOrReport(JobListingSchema, listing)
    },
    async getById(handle, jobListingId) {
      const listing = await handle.jobListing.findUnique({
        where: { id: jobListingId },
        include: {
          company: true,
          locations: true,
        },
      })
      return listing ? parseOrReport(JobListingSchema, listing) : null
    },
    async getAll(handle, page) {
      const listings = await handle.jobListing.findMany({
        include: { company: true, locations: true },
        ...pageQuery(page),
      })
      return listings.map((listing) => parseOrReport(JobListingSchema, listing))
    },
    async findMany(handle, query, page) {
      const jobListings = await handle.jobListing.findMany({
        ...pageQuery(page),
        orderBy: { start: query.orderBy ?? "desc" },
        where: {
          title:
            query.bySearchTerm !== null
              ? {
                  contains: query.bySearchTerm,
                  mode: "insensitive",
                }
              : undefined,
          id:
            query.byId && query.byId.length > 0
              ? {
                  in: query.byId,
                }
              : undefined,
          start: {
            gte: query.byStartDate?.min ?? undefined,
            lte: query.byStartDate?.max ?? undefined,
          },
          end: {
            gte: query.byEndDate?.min ?? undefined,
            lte: query.byEndDate?.max ?? undefined,
          },
        },
        include: { company: true, locations: true },
      })

      return jobListings.map((listing) =>
        parseOrReport(JobListingSchema, {
          ...listing,
        })
      )
    },
    async getActive(handle, page) {
      const listings = await handle.jobListing.findMany({
        where: {
          start: {
            lte: new Date(),
          },
          end: {
            gte: new Date(),
          },
          hidden: false,
        },
        include: { company: true, locations: true },
        ...pageQuery(page),
      })
      return listings.map((listing) => parseOrReport(JobListingSchema, listing))
    },
    async getLocations(handle) {
      const locations = await handle.jobListingLocation.findMany({
        distinct: "name",
      })
      return locations.map((location) => parseOrReport(JobListingLocationSchema, location))
    },
  }
}
