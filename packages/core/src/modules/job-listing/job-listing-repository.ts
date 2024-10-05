import type { Database } from "@dotkomonline/db"
import { type JobListing, type JobListingId, JobListingSchema } from "@dotkomonline/types"
import { type Insertable, type Kysely, type Selectable, sql } from "kysely"
import { type Cursor, orderedQuery } from "../../query"

type JobListingWrite = Insertable<Database["jobListing"]>

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | undefined>
  getAll(take: number, cursor?: Cursor): Promise<JobListing[]>
  createJobListing(values: JobListingWrite): Promise<JobListing>
  updateJobListingById(id: JobListingId, data: JobListingWrite): Promise<JobListing>
}

const mapToJobListing = (jobListing: Selectable<Database["jobListing"]>): JobListing =>
  JobListingSchema.parse(jobListing)

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: Kysely<Database>) {}

  private baseJobListingQuery() {
    return this.db
      .selectFrom("jobListing")
      .leftJoin("jobListingLocationLink", "jobListingLocationLink.jobListingId", "jobListing.id")
      .leftJoin("jobListingLocation", "jobListingLocation.id", "jobListingLocationLink.locationId")
      .leftJoin("company", "company.id", "jobListing.companyId")
      .selectAll("jobListing")
      .select(
        sql<
          string[]
        >`COALESCE(json_agg(job_listing_location.name) FILTER (WHERE job_listing_location.name IS NOT NULL), '[]')`.as(
          "locations"
        )
      )
      .select(
        sql<JobListing["company"]>`json_build_object(
          'id', company.id, 'name', company.name, 'image', company.image
        )`.as("company")
      )
      .groupBy("jobListing.id")
      .groupBy("company.id")
  }

  async createJobListing(data: JobListingWrite): Promise<JobListing> {
    const jobListing = await this.db.insertInto("jobListing").values(data).returningAll().executeTakeFirstOrThrow()
    return this.getById(jobListing.id)
  }

  async updateJobListingById(id: JobListingId, data: JobListingWrite): Promise<JobListing> {
    await this.db.updateTable("jobListing").set(data).where("id", "=", id).execute()
    return this.getById(id)
  }

  async getById(id: string): Promise<JobListing> {
    const jobListing = await this.baseJobListingQuery().where("jobListing.id", "=", id).executeTakeFirstOrThrow()
    return mapToJobListing(jobListing)
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    const ordered = orderedQuery(this.baseJobListingQuery().limit(take), cursor)
    const jobListings = await ordered.execute()
    return jobListings.map(mapToJobListing)
  }
}
