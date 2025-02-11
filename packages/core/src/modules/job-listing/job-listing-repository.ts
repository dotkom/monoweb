import { DBClient } from "@dotkomonline/db"
import { type JobListing, type JobListingId, JobListingSchema, JobListingWrite } from "@dotkomonline/types"

export interface JobListingRepository {
  getById(id: JobListingId): Promise<JobListing | null>
  getAll(take: number): Promise<JobListing[]>
  createJobListing(values: JobListingWrite): Promise<JobListing>
  update(id: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing>
}

export class JobListingRepositoryImpl implements JobListingRepository {
  constructor(private readonly db: DBClient) {}

  async createJobListing(data: JobListingWrite): Promise<JobListing> {
    const { companyId, locationIds, ...rest } = data

    return await this.db.jobListing.create({
      data: {
        ...rest,
        company: {
          connect: {
            id: companyId
          }
        },
        locations: {
          connect: locationIds.map(id => ({ id })) 
        }
      },
      include: {
        company: true,
        locations: true
      }
    })
  }

  async update(id: JobListingId, data: Partial<JobListingWrite>): Promise<JobListing> {
    const { locationIds, ...rest } = data;

    return await this.db.jobListing.update({ where: { id }, data: {
      ...rest,
      locations: {
        connect: locationIds?.map(id => ({ id }))
      }
    }, include: {
      company: true,
      locations: true
    }})
  }

  async getById(id: string): Promise<JobListing | null> {
    return await this.db.jobListing.findUnique({
      where: { id },
      include: {
        company: true,
        locations: true
      }
    })
  }

  async getAll(take: number): Promise<JobListing[]> {
    return await this.db.jobListing.findMany({ take, include: { company: true, locations: true } })
  }
}
