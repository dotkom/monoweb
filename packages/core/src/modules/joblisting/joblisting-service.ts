import { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { JobListingRepository } from "./joblisting-repository"
import { JobListingLocationRepository } from "./joblisting-location-repository"

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
    private readonly jobListingLocationRepository: JobListingLocationRepository
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

    await this.jobListingLocationRepository.add(jobListing.id, locations)

    return {
      ...jobListing,
      locations,
    }
  }

  async update(id: JobListingId, payload: JobListingWrite): Promise<JobListing> {
    const { locations, ...rest } = payload

    const jobListing = await this.jobListingRepository.update(id, rest)

    if (!jobListing) {
      throw new NotFoundError(`Could not update JobListing(${id})`)
    }

    const toRemove = jobListing.locations.filter((x) => !locations.includes(x))
    const toAdd = locations.filter((x) => !jobListing.locations.includes(x))

    await this.jobListingLocationRepository.remove(id, toRemove)
    await this.jobListingLocationRepository.add(id, toAdd)

    return {
      ...jobListing,
      locations,
    }
  }
  async getLocations(): Promise<string[]> {
    const locations = await this.jobListingLocationRepository.getAll()
    return locations
  }
}
