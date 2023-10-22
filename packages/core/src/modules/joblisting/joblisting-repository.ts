import { Database } from "@dotkomonline/db"
import { JobListing, JobListingId, JobListingSchema } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable, sql } from "kysely"
import { Cursor, orderedQuery } from "../../utils/db-utils"
import { map } from "zod"

type JobListingWrite = Insertable<Database["jobListing"]>

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | undefined>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  getAllEploymentTypes(): Promise<string[]>

  create(values: JobListingWrite, locations: string[]): Promise<JobListing | undefined>
  update(id: JobListingId, data: JobListingWrite): Promise<JobListing | undefined>
}

const mapToJobListing = (jobListing: Selectable<Database["jobListing"]>): JobListing => {
  return JobListingSchema.parse(jobListing)
}

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: JobListingWrite, locations: string[]): Promise<JobListing | undefined> {
    // Start a transaction because you might be dealing with multiple inserts
    const jobListing = await this.db.insertInto("jobListing").values(data).returningAll().executeTakeFirst()
    if (!jobListing) {
      return undefined
    }

    const inserted = await this.getById(jobListing.id)

    if (!inserted) {
      return undefined
    }

    return mapToJobListing(inserted)
  }

  async update(id: JobListingId, data: JobListingWrite): Promise<JobListing | undefined> {
    await this.db.updateTable("jobListing").set(data).where("id", "=", id).execute()
    const now = this.getById(id)
    return now
  }

  async getById(id: string): Promise<JobListing | undefined> {
    const jobListing = await this.db
      .selectFrom("jobListing")
      .leftJoin("jobListingLocationLink", "jobListingLocationLink.jobListingId", "jobListing.id")
      .leftJoin("jobListingLocation", "jobListingLocation.id", "jobListingLocationLink.locationId")
      .selectAll("jobListing")
      .select(
        sql<
          string[]
        >`COALESCE(json_agg(job_listing_location.name) FILTER (WHERE job_listing_location.name IS NOT NULL), '[]')`.as(
          "locations"
        )
      )
      .where("jobListing.id", "=", id)
      .groupBy("jobListing.id")
      .executeTakeFirstOrThrow()
    return mapToJobListing(jobListing)
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    const query = this.db
      .selectFrom("jobListing")
      .leftJoin("jobListingLocationLink", "jobListingLocationLink.jobListingId", "jobListing.id")
      .leftJoin("jobListingLocation", "jobListingLocation.id", "jobListingLocationLink.locationId")
      .selectAll("jobListing")
      .select(
        sql<
          string[]
        >`COALESCE(json_agg(job_listing_location.name) FILTER (WHERE job_listing_location.name IS NOT NULL), '[]')`.as(
          "locations"
        )
      )
      .groupBy("jobListing.id")
      .limit(take)

    const ordered = orderedQuery(query, cursor)
    const jobListings = await ordered.execute()

    return jobListings.map(mapToJobListing)
  }

  async getAllEploymentTypes(): Promise<string[]> {
    const employments = await this.db.selectFrom("jobListing").select("employment").execute()

    const employmentsFlat = employments.flatMap((employment) => employment.employment)

    const employmentsSet = new Set(employmentsFlat)

    const noNulls = [...employmentsSet].filter((employment) => employment !== null) as string[]

    return noNulls
  }
}
