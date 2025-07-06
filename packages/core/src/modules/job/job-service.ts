import type { Job, JobId, JobName, JobScheduledAt, JobStatus, JobWrite } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { z } from "zod"
import { JobNotFound, PayloadHandlerNotFoundError, PayloadNotFoundError } from "./job-error"
import type { JobRepository } from "./job-repository"
import { payloadHandler } from "./payload/index"

type PayloadOf<Job extends JobName> = z.infer<(typeof payloadHandler)[Job]["schema"]>

export type JobService = {
  getById: (jobId: JobId) => Promise<Job | null>
  getAllProcessableJobs: () => Promise<Job[]>
  /**
   * Updates a job
   *
   * @throws {JobNotFound} If `data.name` is not provided and the job with the given ID does not exist
   */
  update: (jobId: JobId, data: Partial<JobWrite>) => Promise<Job>
  process: (jobId: JobId, data: Partial<JobWrite>) => Promise<Job>
  cancel: (jobId: JobId) => Promise<Job>

  /**
   * Parses the payload for a job
   *
   * @throws {PayloadNotFoundError} If the payload is not found
   * @throws {PayloadHandlerNotFoundError} If the payload handler for the job is not found
   * @throws {JobPayloadValidationError} If the payload is invalid
   */
  parsePayload: <Job extends JobName>(jobName: Job, payload: JsonValue) => PayloadOf<Job>

  scheduleAttemptReserveAttendeeJob: (
    scheduleAt: JobScheduledAt,
    payload: PayloadOf<"ATTEMPT_RESERVE_ATTENDEE">
  ) => Promise<Job>
  scheduleMergePoolsJob: (scheduleAt: JobScheduledAt, payload: PayloadOf<"MERGE_POOLS">) => Promise<Job>
}

export class JobServiceImpl implements JobService {
  private readonly jobRepository: JobRepository

  constructor(jobsRepository: JobRepository) {
    this.jobRepository = jobsRepository
  }

  private async create(data: JobWrite) {
    let payload = data.payload

    if (data.payload) {
      payload = this.parsePayload(data.name, data.payload)
    }

    return await this.jobRepository.create({ ...data, payload })
  }

  public async update(jobId: JobId, data: Partial<JobWrite>, oldState?: JobStatus) {
    let jobData: Partial<JobWrite> = data

    const existingJob = await this.jobRepository.getById(jobId)

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

    const job = await this.jobRepository.update(jobId, jobData, oldState)
    if (job === null) {
      throw new JobNotFound(`Job with id ${jobId} has wrong state: ${existingJob.status}`)
    }

    return job
  }

  public async process(jobId: JobId, data: Partial<JobWrite>) {
    return await this.update(jobId, { ...data, processedAt: new Date() }, "PENDING")
  }

  public async getById(jobId: JobId) {
    return await this.jobRepository.getById(jobId)
  }

  public async getAllProcessableJobs() {
    return await this.jobRepository.getAllProcessableJobs()
  }

  public async cancel(jobId: JobId) {
    return await this.process(jobId, { status: "CANCELED" })
  }

  public parsePayload<Name extends JobName>(jobName: Name, payload: JsonValue) {
    if (!payload) {
      throw new PayloadNotFoundError(jobName)
    }

    const handler = payloadHandler[jobName]

    if (!handler) {
      throw new PayloadHandlerNotFoundError(jobName)
    }

    return handler.parser(payload)
  }

  public async scheduleAttemptReserveAttendeeJob(
    scheduledAt: JobScheduledAt,
    payload: PayloadOf<"ATTEMPT_RESERVE_ATTENDEE">
  ) {
    return await this.create({
      name: "ATTEMPT_RESERVE_ATTENDEE",
      scheduledAt,
      payload,
    })
  }

  public async scheduleMergePoolsJob(scheduledAt: JobScheduledAt, payload: PayloadOf<"MERGE_POOLS">) {
    return await this.create({
      name: "MERGE_POOLS",
      scheduledAt,
      payload,
    })
  }
}
