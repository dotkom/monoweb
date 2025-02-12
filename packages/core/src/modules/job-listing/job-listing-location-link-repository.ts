import type { DBClient } from "@dotkomonline/db"
import type { JobListingId, JobListingLocationId } from "@dotkomonline/types"

export interface JobListingLocationLinkRepository {
  add(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void>
  remove(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void>
  removeByLocationName(jobListingId: JobListingId, locationName: string): Promise<void>
}

export class JobListingLocationLinkRepositoryImpl implements JobListingLocationLinkRepository {
  constructor(private readonly db: DBClient) {}

  async add(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void> {
    await this.db.jobListingLocationLink.create({ data: { jobListingId, locationId } })
  }

  async removeByLocationName(jobListingId: JobListingId, locationName: string): Promise<void> {
    await this.db.jobListingLocationLink.deleteMany({ where: { jobListingId, location: { name: locationName } } })
  }

  async remove(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void> {
    await this.db.jobListingLocationLink.deleteMany({ where: { jobListingId, locationId } })
  }
}
