import { type DBClient, Prisma, type PrismaClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { addMinutes } from "date-fns"
import type { PaymentWorkflowService } from "../payment/payment-workflow-service"
import { getCurrentUTC } from "@dotkomonline/utils"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import Stripe from "stripe"
import type { Configuration } from "../../configuration"
import { IllegalStateError, RetryableTaskError, TaskSkippedError } from "../../error"
import type { AttendanceService } from "../event/attendance-service"
import type { RecurringTaskService } from "./recurring-task-service"
import { type ClaimedTask, type TaskType, TaskTypeSchema } from "./task"
import {
  type ChargeAttendeeTaskDefinition,
  type OpenPaymentCheckoutTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyAttendanceCompletionTaskDefinition,
  getTaskDefinition,
  tasks,
} from "./task-definition"
import type { TaskDiscoveryService } from "./task-discovery-service"
import type { TaskSchedulingService } from "./task-scheduling-service"
import type { TaskService } from "./task-service"

export interface TaskExecutor {
  startWorker(client: DBClient, signal: AbortSignal): void
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
  logger.warn("TaskExecutor started with local (postgres) backend")

  async function processTask(client: PrismaClient, task: ClaimedTask): Promise<void> {
    let outcome: "completed" | "failed" | "skipped" | "retrying" = "completed"

    async function finishExecution(status: "COMPLETED" | "SKIPPED" | "FAILED") {
      if (task.type === tasks.OPEN_PAYMENT_CHECKOUT.type) {
        await taskService.finishCheckoutTask(client, task.id, task.processedAt, {
          status,
          processedAt: getCurrentUTC(),
        })

        return
      }

      await taskService.setTaskExecutionStatus(client, task.id, status, "RUNNING")
    }

    return await tracer.startActiveSpan(`TaskExecutor/${task.type}`, { root: true }, async (span) => {
      span.setAttribute("rpc.service", "@dotkomonline/rpc")
      span.setAttribute("rpc.system", "trpc")

      try {
        const definition = getTaskDefinition(task.type)
        const payload = taskService.parse(definition, task.payload as Prisma.JsonValue)

        // This happens in Stripe, so we don't want to hold a transaction open for an API call.
        if (task.type === tasks.OPEN_PAYMENT_CHECKOUT.type) {
          const { paymentAttemptId } = payload as InferTaskData<OpenPaymentCheckoutTaskDefinition>
          await paymentWorkflowService.openCheckout(client, paymentAttemptId)

          return
        }

        // This happens in Stripe, so we don't want to hold a transaction open for an API call.
        if (task.type === tasks.CHARGE_ATTENDEE.type) {
          await attendanceService.executeChargeAttendeeTask(
            client,
            payload as InferTaskData<ChargeAttendeeTaskDefinition>
          )

          return
        }

        if (task.type === tasks.VERIFY_ATTENDANCE_COMPLETION.type) {
          await attendanceService.executeVerifyAttendanceCompletionTask(
            client,
            payload as InferTaskData<VerifyAttendanceCompletionTaskDefinition>
          )

          return
        }

        // Run the entire job in its own isolated transaction. This ensures that if the job fails, it does not leave the
        // system in a tainted state (to some degree). If the job performs third-party API calls, it is still possible to
        // leave the system in a tainted state, but that's a less severe bug than leaving the database in a tainted state.
        await client.$transaction(async (handle) => {
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

            case tasks.VERIFY_FEEDBACK_ANSWERED.type:
              return await attendanceService.executeVerifyFeedbackAnsweredTask(
                handle,
                payload as InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
              )

            case tasks.SEND_FEEDBACK_FORM_EMAILS.type:
              return await attendanceService.executeSendFeedbackFormLinkEmailsRecurringTask(handle)

            case tasks.VERIFY_ATTENDEE_ATTENDED.type:
              return await attendanceService.executeVerifyAttendeeAttendedTaskRecurringTask(handle)
          }

          // NOTE: If you have done everything correctly, TypeScript should SCREAM "Unreachable code detected" below. We
          // still keep this block here to prevent subtle bugs or missed cases in the future.
          throw new IllegalStateError(
            `Unreachable code reached in TaskExecutor for Task(ID=${task.id}) for unhandled TaskType ${task.type}`
          )
        })
      } catch (error: unknown) {
        const isSkippedError = error instanceof TaskSkippedError

        // If the task was skipped we don't capture the error, as it is just the reason why the task was skipped.
        if (isSkippedError) {
          outcome = "skipped"

          logger.warn("Job with ID=%s skipped with reason: %o", task.id, error)
          await finishExecution("SKIPPED")
          span.setStatus({ code: SpanStatusCode.OK })

          return
        }

        outcome = "failed"

        // Mark the job as failed using the client, so that regardless of whether the child transaction commits or not,
        // status is updated accordingly.
        logger.error("Job with ID=%s failed with error: %o", task.id, error)

        if (error instanceof Error) {
          span.setStatus({ code: SpanStatusCode.ERROR })
          span.recordException(error)
        }

        if (task.type === tasks.OPEN_PAYMENT_CHECKOUT.type) {
          outcome = "retrying"

          await taskService.finishCheckoutTask(client, task.id, task.processedAt, {
            status: "PENDING",
            scheduledAt: addMinutes(getCurrentUTC(), 1),
            processedAt: null,
          })

          return
        }

        const shouldRetryCompletion =
          task.type === tasks.VERIFY_ATTENDANCE_COMPLETION.type && isRetryableCompletionError(error)
        // A webhook can update the attempt while the capture worker is reading its status from Stripe.
        const shouldRetryCapture =
          task.type === tasks.CHARGE_ATTENDEE.type &&
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"

        if (shouldRetryCompletion || shouldRetryCapture) {
          outcome = "retrying"
          await taskService.update(
            client,
            task.id,
            {
              status: "PENDING",
              scheduledAt: addMinutes(getCurrentUTC(), 1),
              processedAt: null,
            },
            "RUNNING"
          )

          return
        }

        await finishExecution("FAILED")
      } finally {
        // If nothing failed, we mark the job as completed. The reason this is in a finally block is to ensure that
        // regardless of whether the job execution was successful or not, we always update the job status.
        if (outcome === "completed") {
          await finishExecution("COMPLETED")
          logger.info("Job with ID=%s completed successfully", task.id)
          span.setStatus({ code: SpanStatusCode.OK })
        }

        span.end()
      }
    })
  }

  async function drainTasks(client: PrismaClient, signal: AbortSignal, taskTypes: readonly TaskType[]) {
    while (!signal.aborted) {
      const task = await taskDiscoveryService.claimNextTask(taskTypes)

      if (task === null) {
        return
      }

      await processTask(client, task)
    }
  }

  // Each poller has at most one operation in flight. Once idle, it waits before reading the database again.
  function startPolling(signal: AbortSignal, operation: () => Promise<void>) {
    if (signal.aborted) {
      return
    }

    async function poll() {
      try {
        await operation()
      } catch (error) {
        logger.error("Task worker poll failed: %o", error)
      } finally {
        if (!signal.aborted) {
          timer = setTimeout(poll, configuration.tasks.workerInterval)
        }
      }
    }

    let timer = setTimeout(poll, configuration.tasks.workerInterval)
    signal.addEventListener("abort", () => clearTimeout(timer), { once: true })
  }

  async function scheduleRecurringTasks(client: PrismaClient) {
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
      } finally {
        span.end()
      }
    })
  }

  return {
    startWorker(client, signal) {
      const checkoutType = tasks.OPEN_PAYMENT_CHECKOUT.type
      const seatTaskTypes: readonly TaskType[] = [
        tasks.RESERVE_ATTENDEE.type,
        tasks.MERGE_ATTENDANCE_POOLS.type,
        tasks.VERIFY_ATTENDANCE_COMPLETION.type,
      ]
      const otherTaskTypes = TaskTypeSchema.options.filter(
        (type) => type !== checkoutType && !seatTaskTypes.includes(type)
      )

      // Keep seat changes in order without waiting for Stripe checkouts, captures, or feedback emails.
      startPolling(signal, () => drainTasks(client, signal, seatTaskTypes))
      startPolling(signal, () => drainTasks(client, signal, [checkoutType]))
      startPolling(signal, () => drainTasks(client, signal, otherTaskTypes))
      startPolling(signal, () => scheduleRecurringTasks(client))
    },
  }
}

function isRetryableCompletionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Connection acquisition, optimistic update conflicts, transaction timeout, or serialization failure.
    return ["P2024", "P2025", "P2028", "P2034"].includes(error.code)
  }

  return (
    error instanceof RetryableTaskError ||
    error instanceof Stripe.errors.StripeConnectionError ||
    error instanceof Stripe.errors.StripeAPIError ||
    error instanceof Stripe.errors.StripeRateLimitError
  )
}
