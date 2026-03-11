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
  create(
    handle: DBHandle,
    companyId: CompanyId,
    jobListingData: JobListingWrite,
    locationIdsData: JobListingLocationId[]
  ): Promise<JobListing>
  update(
    handle: DBHandle,
    jobListingId: JobListingId,
    jobListingData: Partial<JobListingWrite>,
    locationIdsData: JobListingLocationId[]
  ): Promise<JobListing>
  findById(handle: DBHandle, jobListingId: JobListingId): Promise<JobListing | null>
  findMany(handle: DBHandle, query: JobListingFilterQuery, page: Pageable): Promise<JobListing[]>
  findActiveJobListings(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  findJobListingLocations(handle: DBHandle): Promise<JobListingLocation[]>
}

export function getJobListingRepository(): JobListingRepository {
  return {
    async create(handle, companyId, jobListingData, locationIdsData) {
      const listing = await handle.jobListing.create({
        data: {
          ...jobListingData,
          company: {
            connect: {
              id: companyId,
            },
          },
          locations: {
            createMany: {
              data: locationIdsData.map((locationId) => ({ name: locationId })),
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

    async update(handle, jobListingId, jobListingData, locationIdsData) {
      const listing = await handle.jobListing.update({
        where: { id: jobListingId },
        data: {
          ...jobListingData,
          locations: {
            connectOrCreate: locationIdsData.map((name) => ({
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
                    notIn: locationIdsData,
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

    async findById(handle, jobListingId) {
      const listing = await handle.jobListing.findUnique({
        where: { id: jobListingId },
        include: {
          company: true,
          locations: true,
        },
      })

      return parseOrReport(JobListingSchema.nullable(), listing)
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

    async findActiveJobListings(handle, page) {
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

      return parseOrReport(JobListingSchema.array(), listings)
    },

    async findJobListingLocations(handle) {
      const locations = await handle.jobListingLocation.findMany({
        distinct: "name",
      })

      return parseOrReport(JobListingLocationSchema.array(), locations)
    },
  }
}
