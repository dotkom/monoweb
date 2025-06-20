import type { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { isAfter } from "date-fns"
import { assert } from "../../assert"
import type { Pageable } from "../../query"
import { InvalidEndDateError, JobListingNotFoundError } from "./job-listing-error"
import type { JobListingRepository } from "./job-listing-repository"

export interface JobListingService {
  getById(id: JobListingId): Promise<JobListing>
  getAll(page: Pageable): Promise<JobListing[]>
  getActive(page: Pageable): Promise<JobListing[]>
  create(payload: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, payload: Partial<JobListingWrite>): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingServiceImpl implements JobListingService {
  private readonly jobListingRepository: JobListingRepository

  constructor(jobListingRepository: JobListingRepository) {
    this.jobListingRepository = jobListingRepository
  }

  /**
   * Validate a write model for inconsistencies
   *
   * @throws {InvalidEndDateError} if the end date is before the start date
   */
  private validateWriteModel(input: Partial<JobListingWrite>) {
    assert(
      input.start && input.end && isAfter(input.end, input.start),
      new InvalidEndDateError("end date cannot be before start date")
    )
  }

  async getById(id: JobListingId) {
    const jobListing = await this.jobListingRepository.getById(id)

    if (!jobListing) {
      throw new JobListingNotFoundError(id)
    }

    return jobListing
  }

  async getAll(page: Pageable) {
    return await this.jobListingRepository.getAll(page)
  }
  async getActive(page: Pageable) {
    return await this.jobListingRepository.getActive(page)
  }

  async create(data: JobListingWrite) {
    this.validateWriteModel(data)

    return await this.jobListingRepository.createJobListing(data)
  }

  async update(id: JobListingId, data: Partial<JobListingWrite>) {
    this.validateWriteModel(data)

    return await this.jobListingRepository.update(id, data)
  }

  async getLocations() {
    return await this.jobListingRepository.getLocations()
  }
}
