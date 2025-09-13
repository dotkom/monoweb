import { clearInterval, setInterval } from "node:timers"
import type { DBClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Task } from "@dotkomonline/types"
import { trace } from "@opentelemetry/api"
import { captureException } from "@sentry/node"
import { secondsToMilliseconds } from "date-fns"
import type { AttendanceService } from "../event/attendance-service.ts"
import {
  type ChargeAttendeeTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyPaymentTaskDefinition,
  getTaskDefinition,
  tasks,
} from "./task-definition.ts"
import type { TaskDiscoveryService } from "./task-discovery-service.ts"
import { InvalidTaskKind } from "./task-error.ts"
import type { TaskService } from "./task-service.ts"

const INTERVAL = secondsToMilliseconds(1)

export interface TaskExecutor {
  start(client: DBClient): Promise<void>
  stop(): void
  /**
   * Execute a single task in its own isolated database transaction.
   *
   * The caller should not await this method, as the task itself maintains full control over its state.
   */
  run(client: DBClient, task: Task): Promise<void>
}

export function getLocalTaskExecutor(
  taskService: TaskService,
  taskDiscoveryService: TaskDiscoveryService,
  attendanceService: AttendanceService
): TaskExecutor {
  const logger = getLogger("task-executor")
  const tracer = trace.getTracer("@dotkomonline/rpc/task-executor")
  let intervalId: ReturnType<typeof setInterval> | null = null
  return {
    async start(client) {
      if (intervalId !== null) {
        logger.warn("TaskExecutor is already running, skipping initialization")
        return
      }
      logger.info("Starting TaskExecutor with interval of %d milliseconds", INTERVAL)
      // CORRECTNESS: We do not run the tasks immediately, as we don't want to interrupt the application startup and
      // hog system resources at startup. This should allow us to run the tasks in a more controlled manner and keep the
      // system resources more stable.
      intervalId = setInterval(async () => {
        logger.debug("TaskExecutor performing discovery and execution of all pending tasks")
        const tasks = await taskDiscoveryService.discoverAll()
        for (const task of tasks) {
          // CORRECTNESS: Do not await here, as we would block the entire event loop on each task execution which is
          // very slow for large task queues.
          void this.run(client, task)
        }
      }, INTERVAL)
    },
    stop() {
      if (intervalId === null) {
        logger.warn("TaskExecutor is not running, skipping stop")
        return
      }
      logger.info("Stopping TaskExecutor")
      clearInterval(intervalId)
      intervalId = null
    },
    async run(client, task) {
      let isError = false
      // Log the job execution's start. This is run against the client itself, so that we guarantee that the job is marked
      // as running regardless of whether the child transaction commits or rollbacks.
      logger.info("Running task", task.type, "with arguments", task.payload)
      await taskService.setTaskExecutionStatus(client, task.id, "RUNNING", "PENDING")
      return await tracer.startActiveSpan(`TaskExecutor ${task.type}`, async (span) => {
        span.setAttribute("rpc.service", "@dotkomonline/rpc")
        span.setAttribute("rpc.system", "trpc")
        try {
          // Run the entire job in its own isolated transaction. This ensures that if the job fails, it does not leave the
          // system in a tainted state (to some degree). If the job performs third-party API calls, it is still possible to
          // leave the system in a tainted state, but that's a less severe bug than leaving the database in a tainted state.
          await client.$transaction(async (handle) => {
            const definition = getTaskDefinition(task.type)
            const payload = taskService.parse(definition, task.payload)
            switch (task.type) {
              case tasks.RESERVE_ATTENDEE.type:
                return await attendanceService.executeReserveAttendeeTask(
                  handle,
                  payload as InferTaskData<ReserveAttendeeTaskDefinition>
                )
              case tasks.MERGE_ATTENDANCE_POOLS.type:
                return await attendanceService.executeMergeEventPoolsTask(
                  handle,
                  payload as InferTaskData<MergeAttendancePoolsTaskDefinition>
                )
              case tasks.VERIFY_PAYMENT.type:
                return await attendanceService.executeVerifyPaymentTask(
                  handle,
                  payload as InferTaskData<VerifyPaymentTaskDefinition>
                )
              case tasks.CHARGE_ATTENDEE.type:
                return await attendanceService.executeChargeAttendeeTask(
                  handle,
                  payload as InferTaskData<ChargeAttendeeTaskDefinition>
                )
              case tasks.VERIFY_FEEDBACK_ANSWERED.type:
                return await attendanceService.executeVerifyFeedbackAnsweredTask(
                  handle,
                  payload as InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
                )
            }
            // NOTE: If you have done everything correctly, TypeScript should SCREAM "Unreachable code detected" below. We
            // still keep this block here to prevent subtle bugs or missed cases in the future.
            throw new InvalidTaskKind(task.type, task.id)
          })
        } catch (error: unknown) {
          isError = true
          // Mark the job as failed using the client, so that regardless of whether the child transaction commits or not,
          // status is updated accordingly.
          logger.error("Job with ID=%s failed with error: %o", task.id, error)

          if (error instanceof Error) {
            span.recordException(error)
            captureException(error)
          }

          await taskService.setTaskExecutionStatus(client, task.id, "FAILED", "RUNNING")
        } finally {
          // If nothing failed, we mark the job as completed. The reason this is in a finally block is to ensure that
          // regardless of whether the job execution was successful or not, we always update the job status.
          if (!isError) {
            await taskService.setTaskExecutionStatus(client, task.id, "COMPLETED", "RUNNING")
            logger.info("Job with ID=%s completed successfully", task.id)
          }
          span.end()
        }
      })
    },
  }
}
