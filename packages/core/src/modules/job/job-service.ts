import type { Job, JobId, JobName, JobWrite } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { z } from "zod"
import { JobNotFound, PayloadHandlerNotFoundError, PayloadNotFoundError } from "./job-error"
import type { JobRepository } from "./job-repository"
import { payloadHandlers } from "./payload/"

export type JobService = {
  create: (data: JobWrite) => Promise<Job>
  createMany: (data: JobWrite[]) => Promise<Job[]>
  update: (id: JobId, data: Partial<JobWrite>) => Promise<Job>
  delete: (id: JobId) => Promise<void>
  getById: (id: JobId) => Promise<Job | null>
  getAllProcessableJobs: () => Promise<Job[]>
  cancel: (id: JobId) => Promise<Job>

  parsePayload: <Name extends JobName>(
    name: Name,
    payload: JsonValue
  ) => z.infer<(typeof payloadHandlers)[Name]["schema"]>
}

export class JobServiceImpl implements JobService {
  private readonly jobRepository: JobRepository

  constructor(jobsRepository: JobRepository) {
    this.jobRepository = jobsRepository
  }

  private buildJobData<T extends { name: JobWrite["name"]; payload: JobWrite["payload"] }>(data: T): T {
    const payloadHandler = payloadHandlers[data.name]

    if (!payloadHandler && data.payload) {
      throw new PayloadHandlerNotFoundError(data.name)
    }

    if (payloadHandler && !data.payload) {
      throw new PayloadNotFoundError(data.name)
    }

    const payload: JsonValue = payloadHandler && data.payload ? payloadHandler.parser(data.payload) : null

    return { ...data, payload }
  }

  public async create(data: JobWrite) {
    return await this.jobRepository.create(this.buildJobData(data))
  }

  public async createMany(data: JobWrite[]) {
    if (data.length === 0) {
      throw new JobNotFound("No jobs to create")
    }

    return await this.jobRepository.createMany(data.map((job) => this.buildJobData(job)))
  }

  public async update(id: JobId, data: Partial<JobWrite>) {
    let jobData: Partial<JobWrite> = data

    if (data.payload) {
      const name = data.name || (await this.jobRepository.getById(id))?.name

      if (!name) {
        throw new JobNotFound(`Job with id ${id} not found`)
      }

      jobData = this.buildJobData({ name, payload: data.payload }) as Partial<JobWrite>
    }

    return await this.jobRepository.update(id, jobData)
  }

  public async delete(id: JobId) {
    await this.jobRepository.delete(id)
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
}
