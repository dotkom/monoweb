import type { DBHandle, JobStatus } from "@dotkomonline/db"
import type { Job, JobId, JobWrite } from "@dotkomonline/types"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export interface JobRepository {
  create(handle: DBHandle, data: JobWrite): Promise<Job>
  createMany(handle: DBHandle, data: JobWrite[]): Promise<Job[]>
  update(handle: DBHandle, jobId: string, data: Partial<JobWrite>, oldState?: JobStatus): Promise<Job | null>
  delete(handle: DBHandle, jobId: JobId): Promise<void>
  getById(handle: DBHandle, jobId: JobId): Promise<Job | null>
  getAll(handle: DBHandle): Promise<Job[]>

  /**
   * Get all jobs that are processable. A job is processable if:
   * - It is scheduled to run at or before the current time
   * - Its status is "PENDING"
   */
  getAllProcessableJobs(handle: DBHandle): Promise<Job[]>
}

export function getJobRepository(): JobRepository {
  return {
    async create(handle, data) {
      return await handle.job.create({ data: { ...data, payload: data.payload ?? undefined } })
    },
    async createMany(handle, data) {
      return await handle.job.createManyAndReturn({
        data: data.map((job) => ({ ...job, payload: job.payload ?? undefined })),
      })
    },
    async update(handle, jobId, data, oldStatus) {
      try {
        return await handle.job.update({
          where: { id: jobId, status: oldStatus ? { equals: oldStatus } : undefined },
          data: { ...data, payload: data.payload ?? undefined },
        })
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          // "An operation failed because it depends on one or more records that were required but not found. {cause}"
          if (e.code === "P2025") {
            return null
          }
        }
        throw e
      }
    },
    async delete(handle, jobId) {
      await handle.job.delete({
        where: { id: jobId },
      })
    },
    async getById(handle, jobId) {
      return await handle.job.findUnique({
        where: { id: jobId },
      })
    },
    async getAll(handle) {
      return await handle.job.findMany()
    },
    async getAllProcessableJobs(handle) {
      return await handle.job.findMany({
        where: {
          scheduledAt: { lte: new Date() },
          status: "PENDING",
        },
      })
    },
  }
}
