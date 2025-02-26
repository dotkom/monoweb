import type { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { isAfter, isBefore } from "date-fns"
import assert from "../../assert"
import type { Pageable } from "../../query"
import { InvalidDeadlineError, InvalidEndDateError } from "./job-listing-error"
import type { JobListingRepository } from "./job-listing-repository"

export interface JobListingService {
  getById(id: JobListingId): Promise<JobListing | null>
  getAll(page: Pageable): Promise<JobListing[]>
  create(payload: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, payload: Partial<JobListingWrite>): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingServiceImpl implements JobListingService {
  constructor(private readonly jobListingRepository: JobListingRepository) {}

  async getById(id: JobListingId): Promise<JobListing | null> {
    return await this.jobListingRepository.getById(id)
  }

  async getAll(page: Pageable): Promise<JobListing[]> {
    return await this.jobListingRepository.getAll(page)
  }

  async create(data: JobListingWrite): Promise<JobListing> {
    this.validateWriteModel(data)

    return await this.jobListingRepository.createJobListing(data)
  }

  async update(id: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing> {
    this.validateWriteModel(data)

    return await this.jobListingRepository.update(id, data)
  }

  /**
   * Validate a write model for inconsistencies
   *
   * @throws {InvalidEndDateError} if the end date is before the start date
   * @throws {InvalidDeadlineError} if the deadline is after the start date
   */
  private validateWriteModel(input: Partial<JobListingWrite>): void {
    assert(
      input.start && input.end && isAfter(input.end, input.start),
      new InvalidEndDateError("end date cannot be before start date")
    )
    if (input.deadline && input.start) {
      assert(isBefore(input.deadline, input.start), new InvalidDeadlineError("deadline cannot be after start date"))
    }
  }

  async getLocations(): Promise<string[]> {
    return await this.jobListingRepository.getLocations()
  }
}
