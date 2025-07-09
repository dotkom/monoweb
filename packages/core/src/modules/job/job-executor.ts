import { clearInterval, setInterval } from "node:timers"
import type { DBClient, DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Job } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { minutesToMilliseconds } from "date-fns"
import { AttendanceNotFound } from "../attendance/attendance-error"
import { AttendancePoolNotFoundError } from "../attendance/attendance-pool-error"
import type { AttendanceService } from "../attendance/attendance-service"
import { AttendeeNotFoundError } from "../attendance/attendee-error"
import type { AttendeeService } from "../attendance/attendee-service"
import { InvalidJobType, JobExecutorAlreadyInitializedError, JobExecutorNotInitializedError } from "./job-error"
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

  constructor(jobService: JobService, attendeeService: AttendeeService, attendanceService: AttendanceService) {
    this.jobService = jobService
    this.attendeeService = attendeeService
    this.attendanceService = attendanceService
  }

  private async executeAllProcessableJobs(client: DBClient) {
    this.logger.info("JobExecutor executing all processable jobs at %s", new Date().toISOString())
    const jobs = await this.jobService.getAllProcessableJobs(client)
    this.logger.info("JobExecutor discovery found %d tasks to execute", jobs.length)
    for (const job of jobs) {
      // CORRECTNESS: Do not await here, as we would block the entire event loop on each job execution which is very
      // slow for large job queues.
      void this.runTask(client, job)
    }
  }

  /**
   * Execute a single task in its own isolated database transaction.
   *
   * The caller should not await this method, as the task itself maintains full control over its state.
   */
  private async runTask(client: DBClient, task: Job) {
    let isError = false
    // Log the job execution's start. This is run against the client itself, so that we guarantee that the job is marked
    // as running regardless of whether the child transaction commits or rollbacks.
    await this.jobService.setTaskExecutionStatus(client, task.id, "RUNNING")
    try {
      // Run the entire job in its own isolated transaction. This ensures that if the job fails, it does not leave the
      // system in a tainted state (to some degree). If the job performs third-party API calls, it is still possible to
      // leave the system in a tainted state, but that's a less severe bug than leaving the database in a tainted state.
      await client.$transaction(async (handle) => {
        switch (task.name) {
          case "ATTEMPT_RESERVE_ATTENDEE":
            return await this.runAttemptReserveAttendeeJob(handle, task.payload)
          case "MERGE_POOLS":
            return await this.runMergePoolsJob(handle, task.payload)
          default:
            // NOTE: Do not need to log this, as the below catch block will catch the error after it has bubbled up
            // through the Prisma transaction.
            throw new InvalidJobType(task.name, task.id)
        }
      })
    } catch (error: unknown) {
      isError = true
      // TODO: Sentry.captureExecutionError(error)
      // Mark the job as failed using the client, so that regardless of whether the child transaction commits or not,
      // status is updated accordingly.
      await this.jobService.setTaskExecutionStatus(client, task.id, "FAILED")
      this.logger.error("Job with ID=%s failed with error: %o", task.id, error)
    } finally {
      // If nothing failed, we mark the job as completed. The reason this is in a finally block is to ensure that
      // regardless of whether the job execution was successful or not, we always update the job status.
      if (!isError) {
        await this.jobService.setTaskExecutionStatus(client, task.id, "COMPLETED")
        this.logger.debug("Job with ID=%s completed successfully", task.id)
      }
    }
  }

  /**
   * Starts the job executor polling loop.
   * This method will execute all processable jobs periodically every minute.
   * A job is processable if it is in the "PENDING" state and its `scheduledAt` is now or in the past.
   *
   * @see {@link JobExecutor.stop}
   * @throws {JobExecutorAlreadyInitializedError} if the executor is already initialized.
   */
  public async initialize(client: DBClient) {
    if (this.intervalId) {
      throw new JobExecutorAlreadyInitializedError()
    }
    // setInterval does not run immediately
    await this.executeAllProcessableJobs(client)
    this.intervalId = setInterval(async () => {
      await this.executeAllProcessableJobs(client)
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
  }

  private async runAttemptReserveAttendeeJob(handle: DBHandle, payload: JsonValue) {
    const { userId, attendanceId } = this.jobService.parsePayload("ATTEMPT_RESERVE_ATTENDEE", payload)

    const attendance = await this.attendanceService.getById(handle, attendanceId)

    if (!attendance) {
      throw new AttendanceNotFound(attendanceId)
    }

    const attendee = await this.attendeeService.getByUserId(handle, userId, attendanceId)

    if (!attendee) {
      throw new AttendeeNotFoundError(userId, attendanceId)
    }

    const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)

    if (!pool) {
      throw new AttendancePoolNotFoundError(attendee.attendancePoolId)
    }

    await this.attendeeService.attemptReserve(handle, attendee, pool, { bypassCriteria: false })
  }

  public runMergePoolsJob(handle: DBHandle, payload: JsonValue) {
    const { attendanceId, newMergePoolData } = this.jobService.parsePayload("MERGE_POOLS", payload)

    return this.attendanceService.mergeAttendancePools(handle, attendanceId, newMergePoolData)
  }
}
