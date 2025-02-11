import { DBClient } from "@dotkomonline/db"
import {
  type JobListingLocation,
  type JobListingLocationId,
  JobListingLocationSchema,
  type JobListingLocationWrite,
} from "@dotkomonline/types"

export const mapToJobListingLocation = (payload: JobListingLocation): JobListingLocation =>
  JobListingLocationSchema.parse(payload)

export interface JobListingLocationRepository {
  create(payload: JobListingLocationWrite): Promise<JobListingLocation>
  delete(id: JobListingLocationId): Promise<void>
  removeByZeroUsage(): Promise<void>
  getAll(): Promise<JobListingLocation[]>
  findByName(name: string): Promise<JobListingLocation | null>
  findById(id: JobListingLocationId): Promise<JobListingLocation | null>
}

export class JobListingLocationRepositoryImpl implements JobListingLocationRepository {
  constructor(private readonly db: DBClient) {}

  async getAll(): Promise<JobListingLocation[]> {
    return await this.db.jobListingLocation.findMany({})
  }

  async create(data: JobListingLocationWrite): Promise<JobListingLocation> {
    return await this.db.jobListingLocation.create({ data })
  }

  async delete(id: JobListingLocationId): Promise<void> {
    await this.db.jobListingLocation.delete({ where: { id } })
  }

  async findByName(name: string): Promise<JobListingLocation | null> {
    return await this.db.jobListingLocation.findFirst({ where: { name }})
  }

  async findById(id: JobListingLocationId): Promise<JobListingLocation | null> {
    return await this.db.jobListingLocation.findUnique({ where: { id } })
  }

  async removeByZeroUsage(): Promise<void> {
    await this.db.jobListingLocation.deleteMany({ where: {
      listings: {
        none: {}
      }
    }})
  }
}
