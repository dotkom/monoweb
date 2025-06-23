import type { DBClient } from "@dotkomonline/db"
import type { JobListing, JobListingId, JobListingWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface JobListingRepository {
  getById(jobListingId: JobListingId): Promise<JobListing | null>
  getAll(page: Pageable): Promise<JobListing[]>
  getActive(page: Pageable): Promise<JobListing[]>
  createJobListing(data: JobListingWrite): Promise<JobListing>
  update(jobListingId: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing>
  getLocations(): Promise<string[]>
}

export class JobListingRepositoryImpl implements JobListingRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  /**
   * Takes the locations attribute and turns it from { name: "...", ...}[] to just "..."[]
   */
  private flattenJobListingLocations<T extends { locations: { name: string }[] }>({
    locations,
    ...jobListing
  }: T): Omit<T, "locations"> & { locations: string[] } {
    return {
      ...jobListing,
      locations: locations.map((location) => location.name),
    }
  }

  public async createJobListing({ companyId, locations, ...jobListingWrite }: JobListingWrite) {
    const jobListing = await this.db.jobListing.create({
      data: {
        ...jobListingWrite,
        company: {
          connect: {
            id: companyId,
          },
        },
        locations: {
          createMany: {
            data: locations.map((name) => ({ name })),
          },
        },
      },
      include: {
        company: true,
        locations: true,
      },
    })

    return this.flattenJobListingLocations(jobListing)
  }

  public async update(id: JobListingId, { locations, ...jobListingWrite }: Partial<JobListingWrite>) {
    const updatedJobListing = await this.db.jobListing.update({
      where: { id },
      data: {
        ...jobListingWrite,
        locations: {
          connectOrCreate: locations?.map((name) => ({
            create: { name },
            where: { name_jobListingId: { name, jobListingId: id } },
          })),
          deleteMany: {
            AND: [
              {
                jobListingId: id,
              },
              {
                name: {
                  notIn: locations,
                },
              },
            ],
          },
        },
      },
      include: {
        company: true,
        locations: true,
      },
    })

    return this.flattenJobListingLocations(updatedJobListing)
  }

  public async getById(id: string) {
    const jobListing = await this.db.jobListing.findUnique({
      where: { id },
      include: {
        company: true,
        locations: true,
      },
    })

    if (!jobListing) {
      return null
    }

    return this.flattenJobListingLocations(jobListing)
  }

  public async getAll(page: Pageable) {
    const jobListings = await this.db.jobListing.findMany({
      include: { company: true, locations: true },
      ...pageQuery(page),
    })

    return jobListings.map(this.flattenJobListingLocations)
  }

  public async getActive(page: Pageable) {
    const jobListings = await this.db.jobListing.findMany({
      where: {
        start: {
          lte: new Date(),
        },
        end: {
          gte: new Date(),
        },
        hidden: false,
      },
      include: { company: true, locations: true },
      ...pageQuery(page),
    })

    return jobListings.map(this.flattenJobListingLocations)
  }

  public async getLocations() {
    const allLocations = await this.db.jobListingLocation.findMany({
      distinct: "name",
    })

    return allLocations.map((loc) => loc.name)
  }
}
