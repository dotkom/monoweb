import type { Job } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { ScheduledTask } from "node-cron"
import type { AttendeeService } from "../../attendance/attendee-service.js"
import { JobHandlerDoesNotExistOnGenericJob, JobHandlerNotFound } from "../job-error"
import { AttemptReserveAttendeeJob } from "./attempt-reserve-attendee-job"

export type AnyJob = ReturnType<typeof GenericJob.prototype.into>

export class GenericJob {
  protected attendeeService: AttendeeService

  public readonly id: string
  public readonly createdAt: Date
  public readonly name: string
  public readonly cronExpression: string
  public readonly rawPayload: JsonValue

  public scheduledTask?: ScheduledTask

  constructor(data: Job, attendeeService: AttendeeService) {
    this.attendeeService = attendeeService

    this.id = data.id
    this.createdAt = data.createdAt
    this.name = data.name
    this.cronExpression = data.cronExpression
    this.scheduledTask = undefined

    this.rawPayload = data.payload
  }

  get handlerFunction(): unknown {
    throw new JobHandlerDoesNotExistOnGenericJob()
  }

  public into() {
    // Payload validation is handled in the jobs' constructors. This is to make typing easier
    switch (this.name) {
      case AttemptReserveAttendeeJob.jobName:
        return new AttemptReserveAttendeeJob(this.toJSON(), this.attendeeService)

      default:
        throw new JobHandlerNotFound(`Job ${this.id} has no handler function defined.`)
    }
  }

  private toJSON(): Job {
    return {
      id: this.id,
      createdAt: this.createdAt,
      name: this.name,
      cronExpression: this.cronExpression,
      payload: this.rawPayload,
    }
  }
}
