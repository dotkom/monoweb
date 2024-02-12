import { type JobListing, type JobListingId, type JobListingWrite } from "@dotkomonline/types"
import { isAfter, isBefore } from "date-fns"
import { type JobListingRepository } from "./job-listing-repository"
import { type JobListingLocationRepository, type LocationSelect } from "./job-listing-location-repository"
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
    assert(isBefore(input.start, new Date()), new InvalidStartDateError("Start date cannot be before today"))
    assert(isBefore(input.end, input.start), new InvalidEndDateError("End date cannot be before start date"))
    assert(
      input.deadline === null || isAfter(input.deadline, input.start),
      new InvalidDeadlineError("Deadline cannot be after start date")
    )
    assert(locations.length > 0, new InvalidLocationError("At least one location is required"))

    const jobListing = await this.jobListingRepository.createJobListing(input)
    const allLocations = await this.jobListingLocationRepository.getAll()
    for (const location of locations) {
      const match =
        allLocations.find((x) => x.name === location) ??
        (await this.jobListingLocationRepository.add({ name: location }))
      await this.jobListingLocationLinkRepository.add({
        jobListingId: jobListing.id,
        locationId: match.id,
      })
    }

    return {
      ...jobListing,
      locations,
    }
  }

  async updateJobListingById(id: JobListingId, { locations, ...input }: JobListingWrite): Promise<JobListing> {
    const jobListing = await this.jobListingRepository.updateJobListingById(id, input)
    const allLocations = await this.jobListingLocationRepository.getAll()

    const currentLocationIds = this.getCurrentLocationIds(jobListing, allLocations)
    const newLocationNames = this.getNewLocationNames(locations, jobListing)
    const newLocationIds = this.getNewLocationIds(newLocationNames, allLocations)

    this.validateLocations(currentLocationIds, jobListing, newLocationIds, newLocationNames)

    const { toRemove, toAdd } = this.determineLocationChanges(currentLocationIds, locations, allLocations)
    await this.handleLocationChanges(toRemove, toAdd, jobListing, newLocationNames)

    return {
      ...jobListing,
      locations,
    }
  }

  private getCurrentLocationIds(jobListing: JobListing, allLocations: LocationSelect[]): string[] {
    return jobListing.locations
      .map((loc) => allLocations.find((x) => x.name === loc))
      .filter((x) => x !== undefined)
      .map((x) => x?.id) as string[]
  }

  private getNewLocationNames(providedLocations: string[], jobListing: JobListing): string[] {
    return providedLocations.filter((x) => !jobListing.locations.includes(x))
  }

  private getNewLocationIds(newLocationNames: string[], allLocations: LocationSelect[]): string[] {
    return newLocationNames
      .map((name) => allLocations.find((x) => x.name === name)?.id || null)
      .filter((x) => x !== null) as string[]
  }

  private validateLocations(
    currentLocationIds: string[],
    jobListing: JobListing,
    newLocationIds: string[],
    newLocationNames: string[]
  ) {
    if (
      currentLocationIds.length !== jobListing.locations.length ||
      newLocationIds.length !== newLocationNames.length
    ) {
      throw new NotFoundError(`Could not update JobListing(${jobListing.id})`)
    }
  }

  private determineLocationChanges(
    currentLocationIds: string[],
    providedLocations: string[],
    allLocations: LocationSelect[]
  ) {
    const providedLocationIds = providedLocations.map((name) => allLocations.find((x) => x.name === name)?.id || null)
    const toRemove = currentLocationIds.filter((id) => !providedLocationIds.includes(id))
    const toAdd = providedLocationIds.filter((id) => id === null || !currentLocationIds.includes(id))
    return { toRemove, toAdd }
  }

  private async handleLocationChanges(
    toRemove: string[],
    toAdd: (string | null)[],
    jobListing: JobListing,
    newLocationNames: string[]
  ) {
    for (const locationId of toRemove) {
      await this.jobListingLocationLinkRepository.remove({ jobListingId: jobListing.id, locationId })
    }

    for (let i = 0; i < toAdd.length; i++) {
      const locationId = toAdd[i]
      if (!locationId) {
        const newLocation = await this.jobListingLocationRepository.add({
          name: newLocationNames[i],
        })
        await this.jobListingLocationLinkRepository.add({ jobListingId: jobListing.id, locationId: newLocation.id })
      } else {
        await this.jobListingLocationLinkRepository.add({ jobListingId: jobListing.id, locationId })
      }
    }
  }

  async getLocations(): Promise<string[]> {
    const locations = await this.jobListingLocationRepository.getAll()
    return locations.map((x) => x.name)
  }
}
