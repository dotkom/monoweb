import { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { JobListingRepository } from "./joblisting-repository"

export interface JobListingService {
  get(id: JobListingId): Promise<JobListing>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  create(payload: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, payload: JobListingWrite): Promise<JobListing>
  getLocations(): Promise<string[]>
  getEmploymentTypes(): Promise<string[]>
}

export class JobListingServiceImpl implements JobListingService {
  constructor(private readonly jobListingRepository: JobListingRepository) {}

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
    const jobListing = await this.jobListingRepository.create(rest, locations)
    if (!jobListing) throw new Error("Failed to create jobListing")
    return jobListing
  }

  async update(id: JobListingId, payload: JobListingWrite): Promise<JobListing> {
    const { locations, ...rest } = payload

    const jobListing = await this.jobListingRepository.update(id, rest, locations)

    if (!jobListing) {
      throw new NotFoundError(`Could not update JobListing(${id})`)
    }
    return jobListing
  }
  async getLocations(): Promise<string[]> {
    const locations = await this.jobListingRepository.getAllLocations()
    return locations
  }

  async getEmploymentTypes(): Promise<string[]> {
    const locations = await this.jobListingRepository.getAllLocations()
    return locations
  }
}
