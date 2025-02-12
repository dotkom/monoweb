import type { DBClient } from "@dotkomonline/db"
import type { JobListingLocation, JobListingLocationId, JobListingLocationWrite } from "@dotkomonline/types"

export interface JobListingLocationRepository {
  add(payload: JobListingLocationWrite): Promise<JobListingLocation>
  remove(id: JobListingLocationId): Promise<void>
  removeByZeroUsage(): Promise<void>

  getAll(): Promise<JobListingLocation[]>
  findByName(name: string): Promise<JobListingLocation | null>
  findById(id: JobListingLocationId): Promise<JobListingLocation | null>
}

export class JobListingLocationRepositoryImpl implements JobListingLocationRepository {
  constructor(private readonly db: DBClient) {}

  async getAll(): Promise<JobListingLocation[]> {
    return await this.db.jobListingLocation.findMany({ orderBy: [{ name: "asc" }] })
  }

  async add(data: JobListingLocationWrite): Promise<JobListingLocation> {
    return await this.db.jobListingLocation.create({ data })
  }

  async remove(id: JobListingLocationId): Promise<void> {
    await this.db.jobListingLocation.delete({ where: { id } })
  }

  async findByName(name: string): Promise<JobListingLocation | null> {
    return await this.db.jobListingLocation.findFirst({ where: { name } })
  }

  async findById(id: JobListingLocationId): Promise<JobListingLocation | null> {
    return await this.db.jobListingLocation.findUnique({ where: { id } })
  }

  async removeByZeroUsage(): Promise<void> {
    await this.db.jobListingLocation.deleteMany({ where: { listings: { none: {} } } })
  }
}
