import { type DBClient, Prisma, PrismaErrorCode } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { getCurrentUTC } from "@dotkomonline/utils"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import PQueue from "p-queue"
import Stripe from "stripe"
import type { Configuration } from "../../configuration"
import { ConcurrentModificationError, IllegalStateError, TaskSkippedError } from "../../error"
import type { AttendanceService } from "../event/attendance-service"
import type { PaymentWorkflowService } from "../payment/payment-workflow-service"
import type { RecurringTaskService } from "./recurring-task-service"
import type { ClaimedTask } from "./task"
import { getTaskDefinition, tasks } from "./task-definition"
import type { TaskDiscoveryService } from "./task-discovery-service"
import type { TaskSchedulingService } from "./task-scheduling-service"
import type { TaskOutcome, TaskService } from "./task-service"

export interface TaskExecutor {
  startWorker(client: DBClient, signal: AbortSignal): void
}

function isRetryableTaskError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === PrismaErrorCode.ConnectionPoolTimeout ||
      error.code === PrismaErrorCode.TransactionApiError ||
      error.code === PrismaErrorCode.WriteConflictOrDeadlock
    )
  }

  return (
    error instanceof ConcurrentModificationError ||
    error instanceof Stripe.errors.StripeConnectionError ||
    error instanceof Stripe.errors.StripeAPIError ||
    error instanceof Stripe.errors.StripeRateLimitError
  )
}

export function getLocalTaskExecutor(
  taskService: TaskService,
  recurringTaskService: RecurringTaskService,
  taskDiscoveryService: TaskDiscoveryService,
  taskSchedulingService: TaskSchedulingService,
  attendanceService: AttendanceService,
  paymentWorkflowService: PaymentWorkflowService,
  configuration: Configuration
): TaskExecutor {
  const logger = getLogger("task-executor")
  const tracer = trace.getTracer("@dotkomonline/rpc/task-executor")
  // Limited to one to avoid race conditions due to sloppy code in the service layer :^)
  const queue = new PQueue({ concurrency: 1 })

  logger.warn("TaskExecutor started with local (postgres) backend")

  async function executeTask(client: DBClient, task: ClaimedTask) {
    const payload = task.payload as Prisma.JsonValue
    const type = task.type

    switch (type) {
      case "VERIFY_ATTENDANCE_COMPLETION": {
        const taskData = taskService.parse(tasks[type], payload)

        return client.$transaction((handle) =>
          attendanceService.executeVerifyAttendanceCompletionTask(handle, taskData)
        )
      }

      case "RESERVE_ATTENDEE": {
        const taskData = taskService.parse(tasks[type], payload)

        return client.$transaction((handle) => attendanceService.executeReserveAttendeeTask(handle, taskData))
      }

      case "MERGE_ATTENDANCE_POOLS": {
        const taskData = taskService.parse(tasks[type], payload)

        return client.$transaction((handle) => attendanceService.executeMergeEventPoolsTask(handle, taskData))
      }

      case "VERIFY_FEEDBACK_ANSWERED": {
        const taskData = taskService.parse(tasks[type], payload)

        return client.$transaction((handle) => attendanceService.executeVerifyFeedbackAnsweredTask(handle, taskData))
      }

      case "SEND_FEEDBACK_FORM_EMAILS": {
        taskService.parse(tasks[type], payload)

        return client.$transaction((handle) => attendanceService.executeSendFeedbackFormLinkEmailsRecurringTask(handle))
      }

      case "VERIFY_ATTENDEE_ATTENDED": {
        taskService.parse(tasks[type], payload)

        return client.$transaction((handle) => attendanceService.executeVerifyAttendeeAttendedTaskRecurringTask(handle))
      }

      case "OPEN_PAYMENT_CHECKOUT": {
        const { paymentAttemptId } = taskService.parse(tasks[type], payload)

        // Payment tasks manage their own transactions around calls to Stripe
        await paymentWorkflowService.openCheckout(client, paymentAttemptId)

        return
      }

      case "CHARGE_ATTENDEE": {
        const taskData = taskService.parse(tasks[type], payload)

        return attendanceService.executeChargeAttendeeTask(client, taskData)
      }
    }

    throw new IllegalStateError(`Unhandled task type: ${type satisfies never}`)
  }

  async function processTask(client: DBClient, task: ClaimedTask) {
    await tracer.startActiveSpan(`TaskExecutor/${task.type}`, { root: true }, async (span) => {
      span.setAttribute("rpc.service", "@dotkomonline/rpc")
      span.setAttribute("rpc.system", "trpc")

      try {
        let status: TaskOutcome = "COMPLETED"

        try {
          await executeTask(client, task)
        } catch (error) {
          if (error instanceof TaskSkippedError) {
            status = "SKIPPED"
            logger.warn("Job with ID=%s skipped: %o", task.id, error)
          } else {
            const shouldRetry = task.type === tasks.OPEN_PAYMENT_CHECKOUT.type || isRetryableTaskError(error)
            status = shouldRetry ? "PENDING" : "FAILED"
            logger.error("Job with ID=%s failed: %o", task.id, error)
            span.setStatus({ code: SpanStatusCode.ERROR })

            if (error instanceof Error) {
              span.recordException(error)
            }
          }
        }

        await taskService.finishTask(client, task, status)

        if (status === "COMPLETED" || status === "SKIPPED") {
          span.setStatus({ code: SpanStatusCode.OK })
        }
      } finally {
        span.end()
      }
    })
  }

  return {
    startWorker(client, signal) {
      let timeout: ReturnType<typeof setTimeout> | null = null

      queue.start()
      signal.addEventListener("abort", () => {
        if (queue.pending !== 0) {
          logger.warn("Worker aborted with %s tasks pending in queue", queue.pending)
        }
      })

      async function work() {
        await tracer.startActiveSpan("TaskExecutor/DiscoverTasks", { root: true }, async (span) => {
          try {
            logger.debug("TaskExecutor discovering and scheduling recurring tasks")
            const recurringTasks = await taskDiscoveryService.querySchedulableRecurringTasks()
            const now = getCurrentUTC()

            for (const recurringTask of recurringTasks) {
              const type = getTaskDefinition(recurringTask.type)

              logger.debug(`TaskExecutor scheduling task ${type} from recurring task ${recurringTask.id}`)
              await taskSchedulingService.scheduleAt(client, type, recurringTask.payload, now, recurringTask.id)
              await recurringTaskService.scheduleNextRun(client, recurringTask.id, now)
            }

            if (queue.pending === 0 && !signal.aborted) {
              const task = await taskDiscoveryService.claimNextTask()

              if (task !== null) {
                void queue
                  .add(() => processTask(client, task))
                  .catch((error: unknown) => {
                    logger.error("Failed to finish task with ID=%s: %o", task.id, error)
                  })
              }
            }
          } catch (error) {
            logger.error("Task discovery failed: %o", error)
          } finally {
            if (!signal.aborted) {
              timeout = setTimeout(work, configuration.tasks.workerInterval)
            }

            span.end()
          }
        })
      }

      logger.info("Starting TaskExecutor Worker with interval of %d milliseconds", configuration.tasks.workerInterval)

      timeout = setTimeout(work, configuration.tasks.workerInterval)
      signal.addEventListener("abort", () => {
        if (timeout !== null) {
          clearTimeout(timeout)
        }
      })
    },
  }
}
