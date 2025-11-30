import { clearInterval, type setInterval } from "node:timers"
import type { DBClient, PrismaClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Task } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { captureException } from "@sentry/node"
import { compareAsc } from "date-fns"
import type { Configuration } from "../../configuration"
import { IllegalStateError } from "../../error"
import type { AttendanceService } from "../event/attendance-service"
import type { RecurringTaskService } from "./recurring-task-service"
import {
  type ChargeAttendeeTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyPaymentTaskDefinition,
  getTaskDefinition,
  tasks,
} from "./task-definition"
import type { TaskDiscoveryService } from "./task-discovery-service"
import type { TaskSchedulingService } from "./task-scheduling-service"
import type { TaskService } from "./task-service"

const MAX_TASK_PROCESS_COUNT = 15

export interface TaskExecutor {
  startWorker(client: DBClient, signal: AbortSignal): void
}

export function getLocalTaskExecutor(
  taskService: TaskService,
  recurringTaskService: RecurringTaskService,
  taskDiscoveryService: TaskDiscoveryService,
  taskSchedulingService: TaskSchedulingService,
  attendanceService: AttendanceService,
  configuration: Configuration
): TaskExecutor {
  const logger = getLogger("task-executor")
  const tracer = trace.getTracer("@dotkomonline/rpc/task-executor")

  logger.warn("TaskExecutor started with local (postgres) backend")

  async function processTask(client: PrismaClient, task: Task): Promise<void> {
    let isError = false

    // Log the job execution's start. This is run against the client itself, so that we guarantee that the job is marked
    // as running regardless of whether the child transaction commits or rollbacks.
    await taskService.setTaskExecutionStatus(client, task.id, "RUNNING", "PENDING")

    return await tracer.startActiveSpan(`TaskExecutor/${task.type}`, { root: true }, async (span) => {
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

            case tasks.SEND_FEEDBACK_FORM_EMAILS.type:
              return await attendanceService.executeSendFeedbackFormLinkEmails(handle)

            case tasks.VERIFY_ATTENDEE_ATTENDED.type:
              return await attendanceService.executeVerifyAttendeeAttendedTask(handle)
          }

          // NOTE: If you have done everything correctly, TypeScript should SCREAM "Unreachable code detected" below. We
          // still keep this block here to prevent subtle bugs or missed cases in the future.
          throw new IllegalStateError(
            `Unreachable code reached in TaskExecutor for Task(ID=${task.id}) for unhandled TaskType ${task.type}`
          )
        })
      } catch (error: unknown) {
        isError = true

        // Mark the job as failed using the client, so that regardless of whether the child transaction commits or not,
        // status is updated accordingly.
        logger.error("Job with ID=%s failed with error: %o", task.id, error)

        if (error instanceof Error) {
          span.setStatus({ code: SpanStatusCode.ERROR })
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
        } else {
          span.setStatus({ code: SpanStatusCode.OK })
        }
        span.end()
      }
    })
  }

  return {
    startWorker(client, signal) {
      let interval: ReturnType<typeof setInterval> | null = null

      async function work() {
        await tracer.startActiveSpan("TaskExecutor/DiscoverTasks", { root: true }, async (span) => {
          try {
            // Queue the next recursive call as long as the abort controller hasn't been aborted.
            function enqueueWork() {
              if (!signal.aborted) {
                interval = setTimeout(work, configuration.tasks.workerInterval)
              }
            }

            logger.debug("TaskExecutor discovering and scheduling recurring tasks")
            const recurringTasks = await taskDiscoveryService.discoverRecurringTasks()

            const now = getCurrentUTC()

            for (const recurringTask of recurringTasks) {
              const type = getTaskDefinition(recurringTask.type)

              logger.debug(`TaskExecutor scheduling task ${type} from recurring task ${recurringTask.id}`)
              await taskSchedulingService.scheduleAt(client, type, recurringTask.payload, now, recurringTask.id)
              await recurringTaskService.scheduleNextRun(client, recurringTask.id, now)
            }

            logger.debug("TaskExecutor performing discovery and execution of all pending tasks")
            const tasks = await taskDiscoveryService.discoverAll()

            // Limit the number of tasks per run to avoid exceeding database connections
            const limitedTasks = tasks
              .toSorted((a, b) => compareAsc(a.scheduledAt, b.scheduledAt))
              .slice(0, MAX_TASK_PROCESS_COUNT)

            for (const task of limitedTasks) {
              // CORRECTNESS: Do not await here, as we would block the entire event loop on each task execution which is
              // very slow for large task queues.
              void processTask(client, task)
            }

            enqueueWork()
          } finally {
            span.end()
          }
        })
      }

      logger.info("Starting TaskExecutor Worker with interval of %d milliseconds", configuration.tasks.workerInterval)

      interval = setTimeout(work, configuration.tasks.workerInterval)
      signal.addEventListener("abort", () => {
        if (interval !== null) {
          clearInterval(interval)
        }
      })
    },
  }
}
