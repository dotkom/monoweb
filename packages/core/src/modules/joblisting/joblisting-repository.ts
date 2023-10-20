import { Database } from "@dotkomonline/db"
import { JobListing, JobListingId, JobListingSchema } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable, sql } from "kysely"
import { Cursor, orderedQuery } from "../../utils/db-utils"

type JobListingWrite = Insertable<Database["jobListing"]>

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | undefined>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  getAllLocations(): Promise<string[]>
  getAllEploymentTypes(): Promise<string[]>

  create(values: JobListingWrite, locations: string[]): Promise<JobListing | undefined>
  update(id: JobListingId, data: JobListingWrite, locations: string[]): Promise<JobListing>
}

const mapToJobListing1 = (jobListing: any): JobListing => {
  return JobListingSchema.parse(jobListing)
}

const mapToJobListing2 = (jobListing: Selectable<Database["jobListing"]>, locations: string[]): JobListing => {
  return JobListingSchema.parse({
    ...jobListing,
    locations: locations,
  })
}

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: JobListingWrite, locations: string[]): Promise<JobListing | undefined> {
    // Start a transaction because you might be dealing with multiple inserts
    const jobListing = await this.db.insertInto("jobListing").values(data).returningAll().executeTakeFirst()
    if (!jobListing) {
      return undefined
    }

    // If the data contains locations, insert them
    if (locations && locations.length > 0) {
      await this.db
        .insertInto("jobListingLocation")
        .values(
          locations.map((location) => ({
            jobListingId: jobListing.id,
            location: location,
          }))
        )
        .executeTakeFirstOrThrow()

      return mapToJobListing2(jobListing, locations)
    }

    return mapToJobListing2(jobListing, [])
  }

  async update(id: JobListingId, data: JobListingWrite, locations: string[]): Promise<JobListing> {
    // Start a transaction because you might be dealing with multiple operations (update and possibly insert or delete)
    const jobListing = await this.db
      .updateTable("jobListing")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    // If the data contains locations, update them. Here, I'm assuming you might want to overwrite existing ones.
    if (locations && locations.length > 0) {
      // Delete existing locations
      await this.db.deleteFrom("jobListingLocation").where("jobListingId", "=", id).execute()

      // Insert new ones
      await this.db
        .insertInto("jobListingLocation")
        .values(
          locations.map((location) => ({
            jobListingId: id,
            location,
          }))
        )
        .executeTakeFirstOrThrow()
    }

    return mapToJobListing2(jobListing, locations)
  }

  async getById(id: string): Promise<JobListing | undefined> {
    const jobListing = await this.db
      .selectFrom("jobListing")
      .leftJoin("jobListingLocation", "jobListingLocation.jobListingId", "jobListing.id")
      .selectAll("jobListing")
      .select(sql<string>`COALESCE(json_agg(job_listing_location.location), '[]')`.as("locations"))
      .where("jobListing.id", "=", id)
      .groupBy("jobListing.id")
      .executeTakeFirstOrThrow()
    return mapToJobListing1(jobListing)
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    const query = this.db
      .selectFrom("jobListing")
      .leftJoin("jobListingLocation", "jobListingLocation.jobListingId", "jobListing.id")
      .selectAll("jobListing")
      .select(sql<string>`COALESCE(json_agg(job_listing_location.location), '[]')`.as("locations"))
      .groupBy("jobListing.id")
      .limit(take)
    const ordered = orderedQuery(query, cursor)
    const jobListings = await ordered.execute()
    return jobListings.map(mapToJobListing1)
  }

  async getAllLocations(): Promise<string[]> {
    const locations = await this.db.selectFrom("jobListingLocation").distinctOn("location").select("location").execute()
    return locations.flatMap((location) => location.location)
  }

  async getAllEploymentTypes(): Promise<string[]> {
    const employments = await this.db.selectFrom("jobListing").select("employment").execute()

    const employmentsFlat = employments.flatMap((employment) => employment.employment)

    const employmentsSet = new Set(employmentsFlat)

    const noNulls = [...employmentsSet].filter((employment) => employment !== null) as string[]

    return noNulls
  }
}
