import type { JsonValue } from "@prisma/client/runtime/library"
import { AttendanceNotFound } from "../attendance/attendance-error"
import { AttendancePoolNotFoundError } from "../attendance/attendance-pool-error"
import type { AttendanceService } from "../attendance/attendance-service"
import { AttendeeNotFoundError } from "../attendance/attendee-error"
import type { AttendeeService } from "../attendance/attendee-service"
import { PayloadNotFoundError } from "./job-error"
import type { JobService } from "./job-service"

const ONE_MINUTE_MS = 60_000

export class JobExecutor {
  private readonly jobService: JobService
  private readonly attendeeService: AttendeeService
  private readonly attendanceService: AttendanceService

  private intervalId: NodeJS.Timeout | null = null
  private running = false

  constructor(jobService: JobService, attendeeService: AttendeeService, attendanceService: AttendanceService) {
    this.jobService = jobService
    this.attendeeService = attendeeService
    this.attendanceService = attendanceService
  }

  private async jobCompleted(jobId: string) {
    console.log(`Job ${jobId} completed successfully.`)
    await this.jobService.update(jobId, { status: "COMPLETED" })
  }

  private async jobFailed(jobId: string, error: Error) {
    console.error(`Error processing job ${jobId}:`, error)
    await this.jobService.update(jobId, { status: "FAILED" })
  }

  private async executorLoop() {
    if (this.running) {
      return
    }

    this.running = true

    const jobs = await this.jobService.getAllProcessableJobs()

    for (const job of jobs) {
      switch (job.name) {
        case "AttemptReserveAttendee": {
          await this.runAttemptReserveAttendeeJob(job.payload)
            .then(() => this.jobCompleted(job.id))
            .catch((error) => this.jobFailed(job.id, error))
          break
        }

        default: {
          console.warn(`Unknown job name: ${job.name}`)
          await this.jobService.update(job.id, { status: "FAILED" })
          break
        }
      }
    }

    this.running = false
  }

  public initialize() {
    if (this.intervalId) {
      return this.intervalId
    }

    this.executorLoop() // setInterval does not run immediately
    this.intervalId = setInterval(async () => this.executorLoop(), ONE_MINUTE_MS)

    return this.intervalId
  }

  public getIntervalId() {
    return this.intervalId
  }

  private async runAttemptReserveAttendeeJob(payload: JsonValue) {
    if (!payload) {
      throw new PayloadNotFoundError("AttemptReserveAttendee")
    }

    const { userId, attendanceId } = this.jobService.validatePayload("AttemptReserveAttendee", payload)

    const attendance = await this.attendanceService.getById(attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    const attendee = await this.attendeeService.getByUserId(userId, attendanceId)

    if (!attendee) {
      throw new AttendeeNotFoundError(userId, attendanceId)
    }

    const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)

    if (!pool) {
      throw new AttendancePoolNotFoundError(attendee.attendancePoolId)
    }

    await this.attendeeService.attemptReserve(attendee, pool)
  }
}
