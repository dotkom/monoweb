import type { DBClient } from "@dotkomonline/db"
import type { Job, JobId, JobWrite } from "@dotkomonline/types"

export interface JobRepository {
  create(data: JobWrite): Promise<Job>
  createMany(data: JobWrite[]): Promise<Job[]>
  update(id: string, data: Partial<JobWrite>): Promise<Job>
  delete(id: JobId): Promise<void>
  getById(id: JobId): Promise<Job | null>
  getAll(): Promise<Job[]>
  getAllProcessableJobs(): Promise<Job[]>
}

export class JobsRepositoryImpl implements JobRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(data: JobWrite) {
    return await this.db.job.create({ data: { ...data, payload: data.payload ?? undefined } })
  }

  public async createMany(data: JobWrite[]) {
    return await this.db.job.createManyAndReturn({
      data: data.map((job) => ({ ...job, payload: job.payload ?? undefined })),
    })
  }

  public async update(id: JobId, data: Partial<JobWrite>) {
    return await this.db.job.update({
      where: { id },
      data: { ...data, payload: data.payload ?? undefined },
    })
  }

  public async delete(id: JobId) {
    await this.db.job.delete({
      where: { id },
    })
  }

  public async getById(id: JobId) {
    return await this.db.job.findUnique({
      where: { id },
    })
  }

  public async getAll() {
    return await this.db.job.findMany()
  }

  public async getAllProcessableJobs() {
    return await this.db.job.findMany({
      where: {
        scheduledAt: { lte: new Date() },
        status: "PENDING",
      },
    })
  }
}
