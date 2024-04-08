import type { Database } from "@dotkomonline/db"
import {
  type JobListingLocation,
  type JobListingLocationId,
  JobListingLocationSchema,
  type JobListingLocationWrite,
} from "@dotkomonline/types"
import type { Kysely } from "kysely"

export const mapToJobListingLocation = (payload: JobListingLocation): JobListingLocation =>
  JobListingLocationSchema.parse(payload)

export interface JobListingLocationRepository {
  add(payload: JobListingLocationWrite): Promise<JobListingLocation>
  remove(id: JobListingLocationId): Promise<void>
  removeByZeroUsage(): Promise<void>

  getAll(): Promise<JobListingLocation[]>
  findByName(name: string): Promise<JobListingLocation | null>
  findById(id: JobListingLocationId): Promise<JobListingLocation | null>
}

export class JobListingLocationRepositoryImpl implements JobListingLocationRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAll(): Promise<JobListingLocation[]> {
    const locations = await this.db.selectFrom("jobListingLocation").selectAll().orderBy("name", "asc").execute()
    return locations.map(mapToJobListingLocation)
  }

  async add(payload: JobListingLocationWrite): Promise<JobListingLocation> {
    const location = await this.db
      .insertInto("jobListingLocation")
      .values(payload)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToJobListingLocation(location)
  }

  async remove(id: JobListingLocationId): Promise<void> {
    await this.db.deleteFrom("jobListingLocation").where("id", "=", id).execute()
  }

  async findByName(name: string): Promise<JobListingLocation | null> {
    const location = await this.db
      .selectFrom("jobListingLocation")
      .where("name", "=", name)
      .selectAll()
      .executeTakeFirst()
    return location ? mapToJobListingLocation(location) : null
  }

  async findById(id: JobListingLocationId): Promise<JobListingLocation | null> {
    const location = await this.db.selectFrom("jobListingLocation").where("id", "=", id).selectAll().executeTakeFirst()
    return location ? mapToJobListingLocation(location) : null
  }

  async removeByZeroUsage(): Promise<void> {
    await this.db
      .deleteFrom("jobListingLocation")
      .where("id", "not in", (eb) => eb.selectFrom("jobListingLocationLink").select("locationId"))
      .execute()
  }
}
