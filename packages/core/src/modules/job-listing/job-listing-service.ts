import type { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { isAfter, isBefore } from "date-fns"
import assert from "../../../assert"
import type { Cursor } from "../../utils/cursor-pagination/deprecated-pagination"
import {
  InvalidDeadlineError,
  InvalidEndDateError,
  InvalidStartDateError,
  JobListingNotFoundError,
  MissingLocationError,
} from "./job-listing-error"
import type { JobListingLocationLinkRepository } from "./job-listing-location-link-repository"
import type { JobListingLocationRepository } from "./job-listing-location-repository"
import type { JobListingRepository } from "./job-listing-repository"

export interface JobListingService {
  getById(id: JobListingId): Promise<JobListing>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  createJobListing(payload: JobListingWrite): Promise<JobListing>
  updateJobListingById(id: JobListingId, payload: JobListingWrite): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingServiceImpl implements JobListingService {
  constructor(
    private readonly jobListingRepository: JobListingRepository,
    private readonly jobListingLocationRepository: JobListingLocationRepository,
    private readonly jobListingLocationLinkRepository: JobListingLocationLinkRepository
  ) {}

  /**
   * Get a job listing by its id
   *
   * @throws {JobListingNotFoundError} if the job listing does not exist
   */
  async getById(id: JobListingId): Promise<JobListing> {
    const jobListing = await this.jobListingRepository.getById(id)
    if (!jobListing) {
      throw new JobListingNotFoundError(id)
    }
    return jobListing
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    return await this.jobListingRepository.getAll(take, cursor)
  }

  async createJobListing({ locations, ...input }: JobListingWrite): Promise<JobListing> {
    this.validateWriteModel({ locations, ...input })

    const jobListing = await this.jobListingRepository.createJobListing(input)
    const allLocations = await this.jobListingLocationRepository.getAll()
    for (const location of locations) {
      const match =
        allLocations.find((x) => x.name === location) ??
        (await this.jobListingLocationRepository.add({ name: location }))
      await this.jobListingLocationLinkRepository.add(jobListing.id, match.id)
    }

    return { ...jobListing, locations }
  }

  async updateJobListingById(id: JobListingId, { locations, ...input }: JobListingWrite): Promise<JobListing> {
    const existing = await this.jobListingRepository.getById(id)
    const merged: JobListingWrite = { ...existing, ...input, locations }

    this.validateWriteModel(merged)

    const jobListing = await this.jobListingRepository.updateJobListingById(id, input)
    const diff = this.getLocationDiff(jobListing.locations, locations)
    await this.applyLocationDiff(diff.toRemove, diff.toAdd, jobListing)
    return {
      ...jobListing,
      locations,
    }
  }

  /**
   * Validate a write model for inconsistencies
   *
   * @throws {InvalidStartDateError} if the start date is before today
   * @throws {InvalidEndDateError} if the end date is before the start date
   * @throws {InvalidDeadlineError} if the deadline is after the start date
   * @throws {MissingLocationError} if the location is empty
   */
  private validateWriteModel(input: JobListingWrite): void {
    assert(isAfter(input.start, new Date()), new InvalidStartDateError("start date cannot be before today"))
    assert(isAfter(input.end, input.start), new InvalidEndDateError("end date cannot be before start date"))
    assert(
      input.deadline !== null ? isBefore(input.deadline, input.start) : true,
      new InvalidDeadlineError("deadline cannot be after start date")
    )
    assert(input.locations.length > 0, new MissingLocationError())
  }

  private getLocationDiff(actual: string[], expected: string[]) {
    const toRemove = actual.filter((name) => !expected.includes(name))
    const toAdd = expected.filter((name) => !actual.includes(name))
    return { toRemove, toAdd }
  }

  private async applyLocationDiff(toRemove: string[], toAdd: string[], jobListing: JobListing) {
    for (const locationName of toRemove) {
      await this.jobListingLocationLinkRepository.removeByLocationName(jobListing.id, locationName)
    }

    await this.jobListingLocationRepository.removeByZeroUsage()

    for (const locationName of toAdd) {
      const location =
        (await this.jobListingLocationRepository.findByName(locationName)) ??
        (await this.jobListingLocationRepository.add({ name: locationName }))
      await this.jobListingLocationLinkRepository.add(jobListing.id, location.id)
    }
  }

  async getLocations(): Promise<string[]> {
    const locations = await this.jobListingLocationRepository.getAll()
    return locations.map((x) => x.name)
  }
}
