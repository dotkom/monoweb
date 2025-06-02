import { getLogger } from "@dotkomonline/logger"
import type { JsonValue } from "@prisma/client/runtime/library"
import { minutesToMilliseconds } from "date-fns"
import { AttendanceNotFound } from "../attendance/attendance-error"
import { AttendancePoolNotFoundError } from "../attendance/attendance-pool-error"
import type { AttendanceService } from "../attendance/attendance-service"
import { AttendeeNotFoundError } from "../attendance/attendee-error"
import type { AttendeeService } from "../attendance/attendee-service"
import { JobExecutorAlreadyInitializedError, JobExecutorNotInitializedError, JobNotFound } from "./job-error"
import type { JobService } from "./job-service"

export class JobExecutor {
  private readonly logger = getLogger("job-executor")

  private readonly jobService: JobService
  private readonly attendeeService: AttendeeService
  private readonly attendanceService: AttendanceService

  private intervalId: ReturnType<typeof setInterval> | null = null
  private running = false

  constructor(jobService: JobService, attendeeService: AttendeeService, attendanceService: AttendanceService) {
    this.jobService = jobService
    this.attendeeService = attendeeService
    this.attendanceService = attendanceService
  }

  private async markCompleted(jobId: string) {
    this.logger.info(`Job ${jobId} completed successfully.`)
    await this.jobService.update(jobId, { status: "COMPLETED" })
  }

  private async markFailed(jobId: string, error: Error) {
    this.logger.error(`Error processing job ${jobId}:`, error)
    await this.jobService.update(jobId, { status: "FAILED" })
  }

  private async executeAllProcessableJobs() {
    if (this.running) {
      return
    }

    this.running = true

    const jobs = await this.jobService.getAllProcessableJobs()

    for (const job of jobs) {
      try {
        switch (job.name) {
          case "ATTEMPT_RESERVE_ATTENDEE": {
            await this.runAttemptReserveAttendeeJob(job.payload)
            break
          }

          default: {
            await this.jobService.update(job.id, { status: "FAILED" })

            throw new JobNotFound(`Job with name ${job.name} not found in executor`)
          }
        }
      } catch (error) {
        this.markFailed(job.id, error as Error)
        continue
      }

      this.markCompleted(job.id)
    }

    this.running = false
  }

  public initialize() {
    if (this.intervalId) {
      throw new JobExecutorAlreadyInitializedError()
    }

    this.executeAllProcessableJobs() // setInterval does not run immediately
    this.intervalId = setInterval(this.executeAllProcessableJobs, minutesToMilliseconds(1))
  }

  public stop() {
    if (!this.intervalId) {
      throw new JobExecutorNotInitializedError()
    }

    clearInterval(this.intervalId)
    this.intervalId = null
    this.running = false
  }

  private async runAttemptReserveAttendeeJob(payload: JsonValue) {
    const { userId, attendanceId } = this.jobService.parsePayload("ATTEMPT_RESERVE_ATTENDEE", payload)

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
