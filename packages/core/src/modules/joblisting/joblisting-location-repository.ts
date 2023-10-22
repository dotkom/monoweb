import { Database } from "@dotkomonline/db"
import { JobListingId } from "@dotkomonline/types"
import { Kysely } from "kysely"

export interface JobListingLocationRepository {
  create(jobListingId: JobListingId, locations: string[]): Promise<void>
  add(id: JobListingId, locations: string[]): Promise<void>
  remove(id: JobListingId, locations: string[]): Promise<void>
  getAll(): Promise<string[]>
}

export class JobListingLocationRepositoryImpl implements JobListingLocationRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAll(): Promise<string[]> {
    const locations = await this.db.selectFrom("jobListingLocation").select("name").orderBy("name", "asc").execute()
    return locations.map((x) => x.name)
  }

  async create(jobListingId: JobListingId, locations: string[]): Promise<void> {
    // Start a transaction because you might be dealing with multiple inserts
    this.db.transaction().execute(async (trx) => {
      for (const location of locations) {
        // Check if the location exists in the jobListingLocation table
        let locationEntry = await trx
          .selectFrom("jobListingLocation")
          .where("name", "=", location)
          .select("id")
          .executeTakeFirst()

        if (!locationEntry) {
          // If it doesn't exist, insert it
          locationEntry = await trx
            .insertInto("jobListingLocation")
            .values({ name: location })
            .returning("id")
            .executeTakeFirstOrThrow()
        }

        // Insert into the bridge table
        await trx
          .insertInto("jobListingLocationLink")
          .values({
            jobListingId: jobListingId,
            locationId: locationEntry.id,
          })
          .execute()
      }
    })
  }

  async add(id: JobListingId, locations: string[]): Promise<void> {
    await this.db.transaction().execute(async (transaction) => {
      for (const location of locations) {
        // Check if the location exists in the jobListingLocation table
        let locationEntry = await transaction
          .selectFrom("jobListingLocation")
          .where("name", "=", location)
          .select("id")
          .executeTakeFirst()

        if (!locationEntry) {
          // If it doesn't exist, insert it
          locationEntry = await transaction
            .insertInto("jobListingLocation")
            .values({ name: location })
            .returning("id")
            .executeTakeFirstOrThrow()
        }

        // Check if the link already exists in the bridge table to prevent duplicates
        const existingLink = await transaction
          .selectFrom("jobListingLocationLink")
          .where("jobListingId", "=", id)
          .where("locationId", "=", locationEntry.id)
          .executeTakeFirst()

        if (!existingLink) {
          // Insert into the bridge table
          await transaction
            .insertInto("jobListingLocationLink")
            .values({
              jobListingId: id,
              locationId: locationEntry.id,
            })
            .execute()
        }
      }
    })
  }

  async remove(id: JobListingId, locations: string[]): Promise<void> {
    await this.db.transaction().execute(async (transaction) => {
      for (const location of locations) {
        // Get the location ID
        const locationEntry = await transaction
          .selectFrom("jobListingLocation")
          .where("name", "=", location)
          .select("id")
          .executeTakeFirst()

        if (locationEntry) {
          // Delete from the bridge table
          await transaction
            .deleteFrom("jobListingLocationLink")
            .where("jobListingId", "=", id)
            .where("locationId", "=", locationEntry.id)
            .execute()
        }
      }
    })
  }
}
