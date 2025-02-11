import { DBClient } from "@dotkomonline/db"
import { type JobListing, type JobListingId, JobListingSchema, JobListingWrite } from "@dotkomonline/types"

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | null>
  getAll(take: number): Promise<JobListing[]>
  createJobListing(values: JobListingWrite): Promise<JobListing>
  updateJobListingById(id: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing>
}

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: DBClient) {}

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

  async updateJobListingById(id: JobListingId, data: JobListingUpdate): Promise<JobListing> {
    await this.db.updateTable("jobListing").set(data).where("id", "=", id).execute()
    return this.getById(id)
  }

  async getById(id: string): Promise<JobListing | null> {
    const ret = await this.db.jobListing.findUnique({
      where: { id },
      include: {
        company: true,
        locations: {
          include: {
            location: true
          }
        }
      }
    })
  }

  async getAll(take: number, cursor?: Cursor): Promise<JobListing[]> {
    const ordered = orderedQuery(this.baseJobListingQuery().limit(take), cursor)
    const jobListings = await ordered.execute()
    return jobListings.map(mapToJobListing)
  }
}
