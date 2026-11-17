import type { DBClient, Prisma, PrismaClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { addMinutes } from "date-fns"
import type { PaymentWorkflowService } from "../payment/payment-workflow-service"
import { getCurrentUTC } from "@dotkomonline/utils"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { clearInterval, type setInterval } from "node:timers"
import PQueue from "p-queue"
import type { Configuration } from "../../configuration"
import { IllegalStateError, TaskSkippedError } from "../../error"
import type { AttendanceService } from "../event/attendance-service"
import type { RecurringTaskService } from "./recurring-task-service"
import { isRetryableTaskError, type Task } from "./task"
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
  // Limited to one to avoid race conditions due to sloppy code in the service layer :^)
  const queue = new PQueue({ concurrency: 1 })

  logger.warn("TaskExecutor started with local (postgres) backend")

  async function processTask(client: PrismaClient, task: Task): Promise<void> {
    let outcome: "completed" | "failed" | "skipped" | "retrying" = "completed"

    // Log the job execution's start. This is run against the client itself, so that we guarantee that the job is marked
    // as running regardless of whether the child transaction commits or rollbacks.
    const isCheckoutTask = task.type === tasks.OPEN_PAYMENT_CHECKOUT.type
    const claimedAt = isCheckoutTask ? await taskService.claimCheckoutTask(client, task) : null

    if (isCheckoutTask && claimedAt === null) {
      return
    }

    if (!isCheckoutTask) {
      await taskService.setTaskExecutionStatus(client, task.id, "RUNNING", "PENDING")
    }

    async function finishExecution(status: "COMPLETED" | "SKIPPED" | "FAILED") {
      if (claimedAt !== null) {
        await taskService.finishCheckoutTask(client, task.id, claimedAt, {
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

        // We run most jobs in its own isolated transaction. This ensures that if the job fails, it does not leave the
        // system in a tainted state (to some degree). If the job performs third-party API calls, it is still possible to
        // leave the system in a tainted state, but that's a less severe bug than leaving the database in a tainted state.
        //
        // We don't run API calls in a transaction, as they are not part of the database schema and should not be
        // affected by the transaction. We generally want to hold as few transactions open as possible, so we have room
        // for other transactions to be executed.
        switch (task.type) {
          case tasks.RESERVE_ATTENDEE.type: {
            await client.$transaction(async (handle) => {
              return await attendanceService.executeReserveAttendeeTask(
                handle,
                payload as InferTaskData<ReserveAttendeeTaskDefinition>
              )
            })

            return
          }

          case tasks.MERGE_ATTENDANCE_POOLS.type: {
            await client.$transaction(async (handle) => {
              return await attendanceService.executeMergeEventPoolsTask(
                handle,
                payload as InferTaskData<MergeAttendancePoolsTaskDefinition>
              )
            })

            return
          }

          case tasks.VERIFY_ATTENDANCE_COMPLETION.type: {
            await attendanceService.executeVerifyAttendanceCompletionTask(
              client,
              payload as InferTaskData<VerifyAttendanceCompletionTaskDefinition>
            )

            return
          }

          case tasks.VERIFY_FEEDBACK_ANSWERED.type: {
            await client.$transaction(async (handle) => {
              return await attendanceService.executeVerifyFeedbackAnsweredTask(
                handle,
                payload as InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
              )
            })

            return
          }

          case tasks.SEND_FEEDBACK_FORM_EMAILS.type: {
            await client.$transaction(async (handle) => {
              return await attendanceService.executeSendFeedbackFormLinkEmailsRecurringTask(handle)
            })

            return
          }

          case tasks.VERIFY_ATTENDEE_ATTENDED.type: {
            await client.$transaction(async (handle) => {
              return await attendanceService.executeVerifyAttendeeAttendedTaskRecurringTask(handle)
            })

            return
          }

          // This happens in Stripe, so we don't want to hold a transaction open for an API call.
          case tasks.OPEN_PAYMENT_CHECKOUT.type: {
            const { paymentAttemptId } = payload as InferTaskData<OpenPaymentCheckoutTaskDefinition>
            await paymentWorkflowService.openCheckout(client, paymentAttemptId)

            return
          }

          // This happens in Stripe, so we don't want to hold a transaction open for an API call.
          case tasks.CHARGE_ATTENDEE.type: {
            await attendanceService.executeChargeAttendeeTask(
              client,
              payload as InferTaskData<ChargeAttendeeTaskDefinition>
            )

            return
          }
        }

        // NOTE: If you have done everything correctly, TypeScript should SCREAM "Unreachable code detected" below. We
        // still keep this block here to prevent subtle bugs or missed cases in the future.
        throw new IllegalStateError(
          `Unreachable code reached in TaskExecutor for Task(ID=${task.id}) for unhandled TaskType ${task.type}`
        )
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

        if (claimedAt !== null || isRetryableTaskError(error)) {
          outcome = "retrying"

          const retry = {
            status: "PENDING" as const,
            scheduledAt: addMinutes(getCurrentUTC(), 1),
            processedAt: null,
          }

          if (claimedAt !== null) {
            await taskService.finishCheckoutTask(client, task.id, claimedAt, retry)
          } else {
            await taskService.update(client, task.id, retry, "RUNNING")
          }

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

  return {
    startWorker(client, signal) {
      let interval: ReturnType<typeof setInterval> | null = null

      queue.start()
      signal.addEventListener("abort", () => {
        if (queue.pending !== 0) {
          logger.warn("Worker aborted with %s tasks pending in queue", queue.pending)
        }
      })

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
            const recurringTasks = await taskDiscoveryService.querySchedulableRecurringTasks()
            const now = getCurrentUTC()

            for (const recurringTask of recurringTasks) {
              const type = getTaskDefinition(recurringTask.type)

              logger.debug(`TaskExecutor scheduling task ${type} from recurring task ${recurringTask.id}`)
              await taskSchedulingService.scheduleAt(client, type, recurringTask.payload, now, recurringTask.id)
              await recurringTaskService.scheduleNextRun(client, recurringTask.id, now)
            }

            const task = await taskDiscoveryService.queryNextTask()
            if (task !== null) {
              queue.add(() => processTask(client, task))
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
