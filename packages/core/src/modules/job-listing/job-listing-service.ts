import { type JobListing, type JobListingId, type JobListingWrite } from "@dotkomonline/types"
import { isAfter, isBefore } from "date-fns"
import { type JobListingRepository } from "./job-listing-repository"
import { type JobListingLocationRepository } from "./job-listing-location-repository"
import { type JobListingLocationLinkRepository } from "./job-listing-location-link-repository"
import { type Cursor } from "../../utils/db-utils"
import { NotFoundError } from "../../errors/errors"
import assert from "../../../assert"

export class InvalidStartDateError extends Error {}
export class InvalidEndDateError extends Error {}
export class InvalidLocationError extends Error {}
export class InvalidDeadlineError extends Error {}

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

  async getById(id: JobListingId): Promise<JobListing> {
    const jobListing = await this.jobListingRepository.getById(id)
    if (!jobListing) {
      throw new NotFoundError(`JobListing with ID:${id} not found`)
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

  private validateWriteModel(input: JobListingWrite): void {
    assert(isAfter(input.start, new Date()), new InvalidStartDateError("Start date cannot be before today"))
    assert(isAfter(input.end, input.start), new InvalidEndDateError("End date cannot be before start date"))
    assert(
      input.deadline !== null ? isBefore(input.deadline, input.start) : true,
      new InvalidDeadlineError("Deadline cannot be after start date")
    )
    assert(input.locations.length > 0, new InvalidLocationError("At least one location is required"))
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
