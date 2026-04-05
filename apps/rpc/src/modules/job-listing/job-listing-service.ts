import type { DBHandle } from "@dotkomonline/db"
import type {
  CompanyId,
  JobListing,
  JobListingFilterQuery,
  JobListingId,
  JobListingLocation,
  JobListingLocationId,
  JobListingWrite,
} from "@dotkomonline/types"
import { isAfter } from "date-fns"
import { assert, InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "@dotkomonline/utils"
import type { JobListingRepository } from "./job-listing-repository"
import type { NotificationService } from "../notification/notification-service"

export interface JobListingService {
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
  getById(handle: DBHandle, jobListingId: JobListingId): Promise<JobListing>
  findMany(handle: DBHandle, query: JobListingFilterQuery, page: Pageable): Promise<JobListing[]>
  findActiveJobListings(handle: DBHandle, page: Pageable): Promise<JobListing[]>
  findJobListingLocations(handle: DBHandle): Promise<JobListingLocation[]>
}

export function getJobListingService(
  jobListingRepository: JobListingRepository,
  notificationService: NotificationService
): JobListingService {
  return {
    async create(handle, companyId, jobListingData, locationIdsData) {
      validateJobListingWrite(jobListingData)
      const createdJobListing = await jobListingRepository.create(handle, companyId, jobListingData, locationIdsData)

      const jobListingRecipients = await notificationService.retrieveIntendedRecipientIds(handle, "NEW_JOB_LISTING")
      await notificationService.create(
        handle,
        jobListingRecipients,
        "NEW_JOB_LISTING",
        `Ny stillingsutlysning: ${createdJobListing.title}`,
        `En ny stillingsutlysning med tittelen "${createdJobListing.title}" har blitt publisert.`,
        null,
        "JOB_LISTING",
        createdJobListing.id
      )

      return createdJobListing
    },

    async update(handle, jobListingId, jobListingData, locationIdsData) {
      validateJobListingWrite(jobListingData)
      return await jobListingRepository.update(handle, jobListingId, jobListingData, locationIdsData)
    },

    async findById(handle, jobListingId) {
      return await jobListingRepository.findById(handle, jobListingId)
    },

    async getById(handle, jobListingId) {
      const jobListing = await this.findById(handle, jobListingId)
      if (jobListing === null) {
        throw new NotFoundError(`JobListing(ID=${jobListingId}) not found`)
      }
      return jobListing
    },

    async findMany(handle, query, page) {
      return await jobListingRepository.findMany(handle, query, page)
    },

    async findActiveJobListings(handle, page) {
      return await jobListingRepository.findActiveJobListings(handle, page)
    },

    async findJobListingLocations(handle) {
      return await jobListingRepository.findJobListingLocations(handle)
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
