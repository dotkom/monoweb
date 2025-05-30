import { AttendancePoolSchema, AttendeeSchema, type Job } from "@dotkomonline/types"
import { z } from "zod"
import type { AttendeeService } from "../../attendance/attendee-service"
import { JobPayloadValidationError } from "../job-error"
import { GenericJob } from "./generic-job"

export class AttemptReserveAttendeeJob extends GenericJob {
  public static readonly payloadSchema = z.tuple([AttendeeSchema, AttendancePoolSchema])
  public static readonly handlerName = "attempt-reserve-attendee"

  public payload: z.infer<typeof AttemptReserveAttendeeJob.payloadSchema>

  constructor(data: Job, attendeeService: AttendeeService) {
    super(data, attendeeService)

    const parsedPayload = AttemptReserveAttendeeJob.payloadSchema.safeParse(data.payload)

    if (!parsedPayload.success) {
      throw new JobPayloadValidationError(
        `Invalid payload for AttemptReserveAttendeeJob: ${parsedPayload.error.message}`
      )
    }

    this.payload = parsedPayload.data
  }

  get handlerFunction() {
    return this.attendeeService.attemptReserve
  }
}
