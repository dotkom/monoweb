import { clearInterval, setInterval } from "node:timers"
import { inspect } from "node:util"
import type { DBHandle } from "@dotkomonline/db"
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

/**
 * JobExecutor is responsible for executing jobs at regular intervals.
 *
 * It fetches all processable jobs from the JobService and executes them.
 * - If a job is successfully executed, it marks the job as completed.
 * - If an error occurs during execution, it marks the job as failed.
 *
 * TODO: Turn this into an interface to abstract over in-memory vs SQS
 */
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

  private async markCompleted(handle: DBHandle, jobId: string, jobName: string) {
    this.logger.info(`Job ${jobId} (${jobName}) completed successfully.`)

    await this.jobService.process(handle, jobId, { status: "COMPLETED" })
  }

  private async markFailed(handle: DBHandle, jobId: string, jobName: string, error: Error) {
    this.logger.error(`Error processing job ${jobId} (${jobName}):\n${inspect(error)}`)
    await this.jobService.process(handle, jobId, { status: "FAILED" })
  }

  private async executeAllProcessableJobs(handle: DBHandle) {
    if (this.running) {
      return
    }

    this.running = true

    const jobs = await this.jobService.getAllProcessableJobs(handle)

    for (const job of jobs) {
      try {
        switch (job.name) {
          case "ATTEMPT_RESERVE_ATTENDEE": {
            await this.runAttemptReserveAttendeeJob(job.payload)
            break
          }

          case "MERGE_POOLS": {
            await this.runMergePoolsJob(job.payload)
            break
          }

          default: {
            throw new JobNotFound(`Job with name ${job.name} not found in executor`)
          }
        }
      } catch (error) {
        this.markFailed(handle, job.id, job.name, error as Error)
        continue
      }

      this.markCompleted(handle, job.id, job.name)
    }

    this.running = false
  }

  /**
   * Starts the job executor polling loop.
   * This method will execute all processable jobs periodically every minute.
   * A job is processable if it is in the "PENDING" state and its `scheduledAt` is now or in the past.
   *
   * @see {@link JobExecutor.stop}
   * @throws {JobExecutorAlreadyInitializedError} if the executor is already initialized.
   */
  public initialize(handle: DBHandle) {
    if (this.intervalId) {
      throw new JobExecutorAlreadyInitializedError()
    }
    // setInterval does not run immediately
    this.executeAllProcessableJobs(handle)
    this.intervalId = setInterval(async () => {
      await this.executeAllProcessableJobs(handle)
    }, minutesToMilliseconds(1))
  }

  /**
   * Stops the job executor polling loop.
   * This method will clear the interval and stop executing jobs.
   *
   * @see {@link JobExecutor.initialize}
   * @throws {JobExecutorNotInitializedError} if the executor is not initialized.
   */
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

    await this.attendeeService.attemptReserve(attendee, pool, { bypassCriteria: false })
  }

  public runMergePoolsJob(payload: JsonValue) {
    const { attendanceId, newMergePoolData } = this.jobService.parsePayload("MERGE_POOLS", payload)

    return this.attendanceService.mergeAttendancePools(attendanceId, newMergePoolData)
  }
}
