import type { Job, JobId, JobName, JobScheduledAt, JobWrite } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { z } from "zod"
import { JobNotFound, PayloadHandlerNotFoundError, PayloadNotFoundError } from "./job-error"
import type { JobRepository } from "./job-repository"
import { payloadHandlers } from "./payload/"

type PayloadOf<Job extends JobName> = z.infer<(typeof payloadHandlers)[Job]["schema"]>

export type JobService = {
  getById: (id: JobId) => Promise<Job | null>
  getAllProcessableJobs: () => Promise<Job[]>
  update: (id: JobId, data: Partial<JobWrite>) => Promise<Job>
  cancel: (id: JobId) => Promise<Job>

  parsePayload: <Name extends JobName>(name: Name, payload: JsonValue) => PayloadOf<Name>

  scheduleAttemptReserveAttendeeJob: (
    scheduledAt: JobScheduledAt,
    payload: PayloadOf<"ATTEMPT_RESERVE_ATTENDEE">
  ) => Promise<Job>
  scheduleMergePoolsJob: (scheduledAt: JobScheduledAt, payload: PayloadOf<"MERGE_POOLS">) => Promise<Job>
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

  public async update(id: JobId, data: Partial<JobWrite>) {
    let jobData: Partial<JobWrite> = data

    if (data.payload) {
      const name = data.name || (await this.jobRepository.getById(id))?.name

      if (!name) {
        throw new JobNotFound(`Job with id ${id} not found`)
      }

      const payload = this.parsePayload(name, data.payload)

      jobData = { ...data, payload }
    }

    return await this.jobRepository.update(id, jobData)
  }

  public async getById(id: JobId) {
    return await this.jobRepository.getById(id)
  }

  public async getAllProcessableJobs() {
    return await this.jobRepository.getAllProcessableJobs()
  }

  public async cancel(id: JobId) {
    return await this.update(id, { status: "CANCELED" })
  }

  public parsePayload<Name extends JobName>(name: Name, payload: JsonValue) {
    if (!payload) {
      throw new PayloadNotFoundError(name)
    }

    const handler = payloadHandlers[name]

    if (!handler) {
      throw new PayloadHandlerNotFoundError(name)
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
