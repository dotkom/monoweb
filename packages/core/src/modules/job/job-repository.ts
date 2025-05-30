import type { DBClient } from "@dotkomonline/db"
import type { Job, JobId, JobWrite } from "@dotkomonline/types"
import type { AttendeeService } from "../attendance/attendee-service"
import { JobHandlerNotFound } from "./job-error"
import { AttemptReserveAttendeeJob } from "./jobs/attempt-reserve-attendee-job"
import type { AnyJob } from "./jobs/generic-job"

export interface JobRepository {
  create(data: JobWrite): Promise<AnyJob>
  getById(id: JobId): Promise<AnyJob | null>
  getAll(): Promise<AnyJob[]>
  update(id: string, data: Partial<JobWrite>): Promise<AnyJob>
  delete(id: JobId): Promise<void>
}

export class JobsRepositoryImpl implements JobRepository {
  private readonly db: DBClient

  private readonly attendeeService: AttendeeService

  constructor(db: DBClient, attendeeService: AttendeeService) {
    this.db = db
    this.attendeeService = attendeeService
  }

  private parse(data: Job): AnyJob {
    switch (data.name) {
      case AttemptReserveAttendeeJob.jobName:
        return new AttemptReserveAttendeeJob(data, this.attendeeService)
      default:
        throw new JobHandlerNotFound(data.name)
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

  public async getAll() {
    const response = await this.db.job.findMany()

    return response.map((job) => this.parse(job))
  }

  public async delete(id: JobId) {
    await this.db.job.delete({
      where: { id },
    })
  }
}
