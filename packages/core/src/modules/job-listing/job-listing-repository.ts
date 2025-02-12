import type { DBClient } from "@dotkomonline/db"
import type { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | null>
  getAll(take: number, cursor?: JobListingId): Promise<JobListing[]>
  createJobListing(values: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: DBClient) {}

  async createJobListing({ companyId, locations, ...rest }: JobListingWrite): Promise<JobListing> {
    const jobListing = await this.db.jobListing.create({
      data: {
        ...rest,
        company: {
          connect: {
            id: companyId,
          },
        },
        locations: {
          createMany: {
            data: locations.map(name => ({ name })
          }
        }
      },
      include: {
        company: true,
        locations: true
      },
    })

    return this.flattenJobListingLocations(jobListing)
  }

  async update(id: JobListingId, { locations, ...rest }: Partial<JobListingWrite>): Promise<JobListing> {
    const updatedJobListing = await this.db.jobListing.update({
      where: { id },
      data: {
        ...rest,
        locations: {
          connectOrCreate: locations?.map(name => ({
            create: { name, jobListingId: id },
            where: { name_jobListingId: { name, jobListingId: id }}
          }))
        }
      },
      include: {
        company: true,
        locations: true
      },
    })

    return this.flattenJobListingLocations(updatedJobListing)
  }

  async getById(id: string): Promise<JobListing | null> {
    const jobListing = await this.db.jobListing.findUnique({
      where: { id },
      include: {
        company: true,
        locations: true
      },
    })

    if (jobListing === null)
      return null

    return this.flattenJobListingLocations(jobListing)
  }

  async getAll(take: number, cursor?: string ): Promise<JobListing[]> {
    const jobListings = await this.db.jobListing.findMany({ take, include: { company: true, locations: true }, where: { id: { gt: cursor }} })

    return await jobListings.map(this.flattenJobListingLocations)
  }

  async getLocations(): Promise<string[]> {
    const allLocations = await this.db.jobListingLocation.findMany({
      distinct: "name"
    })

    return allLocations.map(loc => loc.name)
  }

  // Takes the locations attribute and turns it from { name: "...", ...}[] to just "..."[]
  private flattenJobListingLocations<V extends {name: string}, T extends {locations: V[]}>({locations, ...obj}: T): Omit<T, "locations"> & {locations: string[]} {
    return {...obj, locations: locations.map(({ name }) => name)}
  }
}
