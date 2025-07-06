import type { DBClient, JobStatus } from "@dotkomonline/db"
import type { Job, JobId, JobWrite } from "@dotkomonline/types"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export interface JobRepository {
  create(data: JobWrite): Promise<Job>
  createMany(data: JobWrite[]): Promise<Job[]>
  update(jobId: string, data: Partial<JobWrite>, oldState?: JobStatus): Promise<Job | null>
  delete(jobId: JobId): Promise<void>
  getById(jobId: JobId): Promise<Job | null>
  getAll(): Promise<Job[]>

  /**
   * Get all jobs that are processable. A job is processable if:
   * - It is scheduled to run at or before the current time
   * - Its status is "PENDING"
   */
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

  public async update(jobId: JobId, data: Partial<JobWrite>, oldStatus?: JobStatus) {
    try {
      return await this.db.job.update({
        where: { id: jobId, status: oldStatus ? { equals: oldStatus } : undefined },
        data: { ...data, payload: data.payload ?? undefined },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return null
        }
      }

      throw e
    }
  }

  public async delete(jobId: JobId) {
    await this.db.job.delete({
      where: { id: jobId },
    })
  }

  public async getById(jobId: JobId) {
    return await this.db.job.findUnique({
      where: { id: jobId },
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
