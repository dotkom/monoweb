import { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { JobListingRepository } from "./job-listing-repository"
import { JobListingLocationRepository, LocationSelect } from "./job-listing-location-repository"
import { JobListingLocationLinkRepository } from "./job-listing-location-link-repository"

export interface JobListingService {
  get(id: JobListingId): Promise<JobListing>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  create(payload: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, payload: JobListingWrite): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingServiceImpl implements JobListingService {
  constructor(
    private readonly jobListingRepository: JobListingRepository,
    private readonly jobListingLocationRepository: JobListingLocationRepository,
    private readonly jobListingLocationLinkRepository: JobListingLocationLinkRepository
  ) {}

  async get(id: JobListingId): Promise<JobListing> {
    const jobListing = await this.jobListingRepository.getById(id)
    if (!jobListing) throw new NotFoundError(`JobListing with ID:${id} not found`)
    return jobListing
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    const jobListings = await this.jobListingRepository.getAll(take, cursor)
    return jobListings
  }

  async create(payload: JobListingWrite): Promise<JobListing> {
    const { locations, ...rest } = payload

    const jobListing = await this.jobListingRepository.create(rest)
    if (!jobListing) throw new Error("Failed to create jobListing")

    const allLocations = await this.jobListingLocationRepository.getAll()

    for (const location of locations) {
      let locationId

      const existingLocation = allLocations.find((x) => x.name === location)
      if (existingLocation) {
        locationId = existingLocation.id
      } else {
        const newLocation = await this.jobListingLocationRepository.add({ name: location })
        locationId = newLocation.id
      }

      await this.jobListingLocationLinkRepository.add({
        jobListingId: jobListing.id,
        locationId: locationId,
      })
    }

    return {
      ...jobListing,
      locations,
    }
  }

  async update(id: JobListingId, payload: JobListingWrite): Promise<JobListing> {
    const { locations, ...rest } = payload

    const jobListing = await this.jobListingRepository.update(id, rest)

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
      .filter((x) => x !== undefined) as string[]
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
      await this.jobListingLocationLinkRepository.remove({ jobListingId: jobListing.id, locationId: locationId })
    }

    for (let i = 0; i < toAdd.length; i++) {
      const locationId = toAdd[i]
      if (!locationId) {
        const newLocation = await this.jobListingLocationRepository.add({
          name: newLocationNames[i],
        })
        await this.jobListingLocationLinkRepository.add({ jobListingId: jobListing.id, locationId: newLocation.id })
      } else {
        await this.jobListingLocationLinkRepository.add({ jobListingId: jobListing.id, locationId: locationId })
      }
    }
  }

  async getLocations(): Promise<string[]> {
    const locations = await this.jobListingLocationRepository.getAll()
    return locations.map((x) => x.name)
  }
}
