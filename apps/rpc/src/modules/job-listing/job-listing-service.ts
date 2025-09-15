import type { DBHandle } from "@dotkomonline/db"
import type {
  CompanyId,
  JobListing,
  JobListingId,
  JobListingLocation,
  JobListingLocationId,
  JobListingWrite,
} from "@dotkomonline/types"
import { isAfter } from "date-fns"
import { assert, InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { JobListingRepository } from "./job-listing-repository"

export interface JobListingService {
  getById(handle: DBHandle, id: JobListingId): Promise<JobListing>
  getAll(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  getActive(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  create(
    handle: DBHandle,
    payload: JobListingWrite,
    companyId: CompanyId,
    locationIds: JobListingLocationId[]
  ): Promise<JobListing>
  update(
    handle: DBHandle,
    id: JobListingId,
    payload: Partial<JobListingWrite>,
    companyId: CompanyId,
    locationIds: JobListingLocationId[]
  ): Promise<JobListing>
  getLocations(handle: DBHandle): Promise<JobListingLocation[]>
}

export function getJobListingService(jobListingRepository: JobListingRepository): JobListingService {
  return {
    async getById(handle, id) {
      const jobListing = await jobListingRepository.getById(handle, id)
      if (jobListing === null) {
        throw new NotFoundError(`JobListing(ID=${id}) not found`)
      }
      return jobListing
    },
    async getAll(handle, page) {
      return await jobListingRepository.getAll(handle, page)
    },
    async getActive(handle, page) {
      return await jobListingRepository.getActive(handle, page)
    },
    async create(handle, payload, companyId, locationIds) {
      validateJobListingWrite(payload)
      return await jobListingRepository.createJobListing(handle, payload, companyId, locationIds)
    },
    async update(handle, id, payload, companyId, locationIds) {
      validateJobListingWrite(payload)
      return await jobListingRepository.update(handle, id, payload, companyId, locationIds)
    },
    async getLocations(handle) {
      return await jobListingRepository.getLocations(handle)
    },
  }
}

/**
 * Validate a write model for inconsistencies
 *
 * @throws {InvalidArgumentError} if the end date is before the start date
 */
function validateJobListingWrite(input: Partial<JobListingWrite>) {
  assert(
    input.start && input.end && isAfter(input.end, input.start),
    new InvalidArgumentError("End date cannot be before start date")
  )
}
