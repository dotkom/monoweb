import type { DBHandle } from "@dotkomonline/db"
import type {
  CompanyId,
  JobListing,
  JobListingId,
  JobListingLocation,
  JobListingLocationId,
  JobListingWrite,
} from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface JobListingRepository {
  getById(handle: DBHandle, jobListingId: JobListingId): Promise<JobListing | null>
  getAll(handle: DBHandle, page: Pageable): Promise<JobListing[]>
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
      return await handle.jobListing.create({
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
    },
    async update(handle, jobListingId, data, companyId, locationIds) {
      return await handle.jobListing.update({
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
    },
    async getById(handle, jobListingId) {
      return await handle.jobListing.findUnique({
        where: { id: jobListingId },
        include: {
          company: true,
          locations: true,
        },
      })
    },
    async getAll(handle, page) {
      return await handle.jobListing.findMany({
        include: { company: true, locations: true },
        ...pageQuery(page),
      })
    },
    async getActive(handle, page) {
      return await handle.jobListing.findMany({
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
    },
    async getLocations(handle) {
      return await handle.jobListingLocation.findMany({
        distinct: "name",
      })
    },
  }
}
