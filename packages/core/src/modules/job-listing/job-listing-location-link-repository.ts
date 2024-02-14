import { type Database } from "@dotkomonline/db"
import { type JobListingId, type JobListingLocationId } from "@dotkomonline/types"
import { type Kysely } from "kysely"

export interface JobListingLocationLinkRepository {
  add(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void>
  remove(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void>
  removeByLocationName(jobListingId: JobListingId, locationName: string): Promise<void>
}

export class JobListingLocationLinkRepositoryImpl implements JobListingLocationLinkRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async add(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void> {
    await this.db
      .insertInto("jobListingLocationLink")
      .values({ locationId, jobListingId })
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async removeByLocationName(jobListingId: JobListingId, locationName: string): Promise<void> {
    await this.db
      .deleteFrom("jobListingLocationLink")
      .where("jobListingId", "=", jobListingId)
      .where("locationId", "=", (eb) =>
        eb.selectFrom("jobListingLocation").where("name", "=", locationName).select("id")
      )
      .execute()
  }

  async remove(jobListingId: JobListingId, locationId: JobListingLocationId): Promise<void> {
    await this.db
      .deleteFrom("jobListingLocationLink")
      .where("jobListingId", "=", jobListingId)
      .where("locationId", "=", locationId)
      .execute()
  }
}
