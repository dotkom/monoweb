import type { Job } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { ScheduledTask } from "node-cron"
import type { z } from "zod"
import type { AttendeeService } from "../../attendance/attendee-service.js"
import { JobHandlerDoesNotExistOnGenericJob, JobHandlerNotFound, JobPayloadValidationError } from "../job-error"
import { AttemptReserveAttendeeJob } from "./attempt-reserve-attendee-job"

export type AnyJob = ReturnType<typeof GenericJob.prototype.into>

export class GenericJob {
  protected attendeeService: AttendeeService

  public readonly id: string
  public readonly enabled: boolean
  public readonly cronExpression: string
  public readonly rawPayload: JsonValue
  public readonly handler: string
  public readonly createdAt: Date

  public scheduledTask?: ScheduledTask

  constructor(data: Job, attendeeService: AttendeeService) {
    this.attendeeService = attendeeService

    this.id = data.id
    this.enabled = data.enabled
    this.cronExpression = data.cronExpression
    this.handler = data.handler
    this.createdAt = data.createdAt
    this.scheduledTask = undefined

    this.rawPayload = data.payload
  }

  get handlerFunction(): unknown {
    throw new JobHandlerDoesNotExistOnGenericJob()
  }

  public into() {
    const errorMessage = `Job ${this.id} has no handler function defined.`

    switch (this.handler) {
      case AttemptReserveAttendeeJob.handlerId: {
        if (!this.isAttemptReserveAttendeeJob()) {
          throw new JobHandlerNotFound(errorMessage)
        }

        return new AttemptReserveAttendeeJob(this.toJSON(), this.attendeeService)
      }

      default:
        throw new JobHandlerNotFound(errorMessage)
    }
  }

  public isAttemptReserveAttendeeJob(): this is AttemptReserveAttendeeJob {
    return this.handler === AttemptReserveAttendeeJob.handlerId
  }

  private toJSON(): Job {
    return {
      id: this.id,
      enabled: this.enabled,
      cronExpression: this.cronExpression,
      payload: this.rawPayload,
      handler: this.handler,
      createdAt: this.createdAt,
    }
  }
}
