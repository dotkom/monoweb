import type { DBHandle } from "@dotkomonline/db"
import type { Job, JobId, JobName, JobScheduledAt, JobStatus, JobWrite } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { z } from "zod"
import { JobNotFound, PayloadHandlerNotFoundError, PayloadNotFoundError } from "./job-error"
import type { JobRepository } from "./job-repository"
import { payloadHandler } from "./payload/index"

type PayloadOf<Job extends JobName> = z.infer<(typeof payloadHandler)[Job]["schema"]>

export type JobService = {
  getById(handle: DBHandle, jobId: JobId): Promise<Job | null>
  getAllProcessableJobs(handle: DBHandle): Promise<Job[]>
  /**
   * Updates a job
   *
   * @throws {JobNotFound} If `data.name` is not provided and the job with the given ID does not exist
   */
  update(handle: DBHandle, jobId: JobId, data: Partial<JobWrite>, oldState: JobStatus): Promise<Job>
  process(handle: DBHandle, jobId: JobId, data: Partial<JobWrite>): Promise<Job>
  cancel(handle: DBHandle, jobId: JobId): Promise<Job>
  scheduleAttemptReserveAttendeeJob(
    handle: DBHandle,
    scheduleAt: JobScheduledAt,
    payload: PayloadOf<"ATTEMPT_RESERVE_ATTENDEE">
  ): Promise<Job>
  scheduleMergePoolsJob(handle: DBHandle, scheduleAt: JobScheduledAt, payload: PayloadOf<"MERGE_POOLS">): Promise<Job>
  /**
   * Parses the payload for a job
   *
   * @throws {PayloadNotFoundError} If the payload is not found
   * @throws {PayloadHandlerNotFoundError} If the payload handler for the job is not found
   * @throws {JobPayloadValidationError} If the payload is invalid
   */
  parsePayload<Name extends JobName>(jobName: Name, payload: JsonValue): PayloadOf<Name>
}

export function getJobService(jobRepository: JobRepository): JobService {
  return {
    async getById(handle, jobId) {
      return await jobRepository.getById(handle, jobId)
    },
    async getAllProcessableJobs(handle) {
      return await jobRepository.getAllProcessableJobs(handle)
    },
    async update(handle, jobId, data, oldState) {
      let jobData: Partial<JobWrite> = data
      const existingJob = await jobRepository.getById(handle, jobId)
      if (!existingJob) {
        throw new JobNotFound(`Job with id ${jobId} not found`)
      }

      if (data.payload) {
        const name = data.name || existingJob?.name
        if (!name) {
          throw new JobNotFound(`Job with id ${jobId} not found`)
        }

        const payload = this.parsePayload(name, data.payload)
        jobData = { ...data, payload }
      }

      const job = await jobRepository.update(handle, jobId, jobData, oldState)
      if (job === null) {
        throw new JobNotFound(`Job with id ${jobId} has wrong state: ${existingJob.status}`)
      }

      return job
    },
    async process(handle, jobId, data) {
      return await this.update(handle, jobId, { ...data, processedAt: new Date() }, "PENDING")
    },
    async cancel(handle, jobId) {
      return await this.process(handle, jobId, { status: "CANCELED" })
    },
    async scheduleAttemptReserveAttendeeJob(handle, scheduledAt, payload) {
      return await jobRepository.create(handle, {
        ...this.parsePayload("ATTEMPT_RESERVE_ATTENDEE", payload),
        name: "ATTEMPT_RESERVE_ATTENDEE",
        scheduledAt,
      })
    },
    async scheduleMergePoolsJob(handle, scheduledAt, payload) {
      return await jobRepository.create(handle, {
        ...this.parsePayload("MERGE_POOLS", payload),
        name: "MERGE_POOLS",
        scheduledAt,
      })
    },
    parsePayload<Name extends JobName>(jobName: Name, payload: JsonValue) {
      if (!payload) {
        throw new PayloadNotFoundError(jobName)
      }

      const handler = payloadHandler[jobName]

      if (!handler) {
        throw new PayloadHandlerNotFoundError(jobName)
      }

      return handler.parser(payload)
    },
  }
}
