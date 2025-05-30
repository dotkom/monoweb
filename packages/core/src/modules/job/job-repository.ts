import type { DBClient } from "@dotkomonline/db"
import type { Job, JobId, JobWrite } from "@dotkomonline/types"
import { JobHandlerNotFound } from "./job-error"
import { AttemptReserveAttendeeJob } from "./jobs/attempt-reserve-attendee-job"
import type { AnyJob, GenericJob } from "./jobs/generic-job"
import { AttendeeService } from "../attendance/attendee-service"

export interface JobsRepository {
  create(data: JobWrite): Promise<AnyJob>
  getById(id: JobId): Promise<AnyJob | null>
  getEnabledJobs(): Promise<AnyJob[]>
  getAllJobs(): Promise<AnyJob[]>
  update(id: string, data: Partial<JobWrite>): Promise<AnyJob>
  delete(id: JobId): Promise<void>
}

export class JobsRepositoryImpl implements JobsRepository {
  private readonly db: DBClient

  private readonly attendeeService: AttendeeService

  constructor(db: DBClient, attendeeService: AttendeeService) {
    this.db = db
    this.attendeeService = attendeeService
  }

  private parse(data: Job): AnyJob {
    switch (data.handler) {
      case "attempt-reserve-attendee":
        return new AttemptReserveAttendeeJob(data, this.attendeeService)
      default:
        throw new JobHandlerNotFound(data.handler)
    }
  }

  public async create(data: JobWrite) {
    // TODO: Handle payload
    const response = await this.db.job.create({ data: { ...data, payload: undefined } })

    return this.parse(response)
  }

  public async getById(id: JobId) {
    const response = await this.db.job.findUnique({
      where: { id },
    })

    if (!response) {
      return null
    }

    return this.parse(response)
  }

  public async createMany(data: JobWrite[]) {
    await this.db.job.createMany({
      // TODO: Handle payload
      data: data.map((job) => ({ ...job, payload: undefined })),
    })
  }

  public async update(id: JobId, data: Partial<JobWrite>) {
    const result = await this.db.job.update({
      where: { id },
      // TODO: Handle payload
      data: { ...data, payload: undefined },
    })

    return this.parse(result)
  }

  public async getEnabledJobs() {
    const response = await this.db.job.findMany({
      where: {
        enabled: true,
      },
    })

    return response.map((job) => this.parse(job))
  }

  public async getAllJobs() {
    const response = await this.db.job.findMany()

    return response.map((job) => this.parse(job))
  }

  public async delete(id: JobId) {
    await this.db.job.delete({
      where: { id },
    })
  }
}
