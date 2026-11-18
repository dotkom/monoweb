import { type DBClient, type DBHandle, Prisma, PrismaErrorCode } from "@dotkomonline/db"
import Stripe from "stripe"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { Configuration } from "../../configuration"
import { ConcurrentModificationError, TaskSkippedError } from "../../error"
import type { PaymentWorkflowService } from "../payment/payment-workflow-service"
import type { PaymentRecord } from "../payment/payment"
import type { AttendanceService } from "../event/attendance-service"
import type { RecurringTaskService } from "./recurring-task-service"
import type { ClaimedTask, Task } from "./task"
import { tasks } from "./task-definition"
import type { TaskDiscoveryService } from "./task-discovery-service"
import { getLocalTaskExecutor } from "./task-executor"
import type { TaskSchedulingService } from "./task-scheduling-service"
import type { TaskService } from "./task-service"

function createFixture(type: Task["type"] = tasks.CHARGE_ATTENDEE.type) {
  const client = mock<DBClient>()
  const transactionHandle = mock<DBHandle>()
  const attendanceService = mock<AttendanceService>()
  const paymentWorkflowService = mock<PaymentWorkflowService>()
  const taskService = mock<TaskService>()
  const discoveryService = mock<TaskDiscoveryService>()
  const controller = new AbortController()
  const payload = {
    attendeeId: "attendee",
    paymentAttemptId: "attempt",
  }
  const claimedAt = new Date()
  const task: ClaimedTask = {
    id: "task",
    type,
    payload,
    status: "RUNNING",
    processedAt: claimedAt,
    createdAt: claimedAt,
    scheduledAt: claimedAt,
    recurringTaskId: null,
  }
  const configuration = mock<Configuration>({
    tasks: {
      workerInterval: 100,
    },
  })

  discoveryService.querySchedulableRecurringTasks.mockResolvedValue([])
  discoveryService.claimNextTask.mockResolvedValueOnce(task).mockResolvedValue(null)
  taskService.parse.mockReturnValue(payload)
  client.$transaction.mockImplementation(async (operation) => {
    return await operation(transactionHandle)
  })

  const executor = getLocalTaskExecutor(
    taskService,
    mock<RecurringTaskService>(),
    discoveryService,
    mock<TaskSchedulingService>(),
    attendanceService,
    paymentWorkflowService,
    configuration
  )

  async function runTask() {
    executor.startWorker(client, controller.signal)

    try {
      await vi.advanceTimersByTimeAsync(configuration.tasks.workerInterval)
    } finally {
      controller.abort()
    }
  }

  return {
    client,
    transactionHandle,
    discoveryService,
    attendanceService,
    paymentWorkflowService,
    taskService,
    payload,
    runTask,
    task,
  }
}

describe("task executor transaction boundaries", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("captures payments without an enclosing transaction and marks the task completed", async () => {
    const { client, attendanceService, taskService, task, payload, runTask } = createFixture()

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(attendanceService.executeChargeAttendeeTask).toHaveBeenCalledExactlyOnceWith(client, payload)
    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "COMPLETED")
  })

  it.each([
    { error: new Error("Stripe unavailable"), expectedStatus: "FAILED" },
    { error: new TaskSkippedError("Attempt was replaced"), expectedStatus: "SKIPPED" },
    {
      error: new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: PrismaErrorCode.RecordNotFound,
        clientVersion: "test",
      }),
      expectedStatus: "FAILED",
    },
  ])("records $expectedStatus when capture does not complete", async ({ error, expectedStatus }) => {
    const { client, attendanceService, taskService, task, runTask } = createFixture()
    attendanceService.executeChargeAttendeeTask.mockRejectedValue(error)

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, expectedStatus)
  })

  it.each([
    new ConcurrentModificationError("Pool changed"),
    new Prisma.PrismaClientKnownRequestError("Transaction write conflict", {
      code: PrismaErrorCode.WriteConflictOrDeadlock,
      clientVersion: "test",
    }),
  ])("reschedules a pool merge that encounters %s", async (error) => {
    const { client, attendanceService, taskService, task, runTask } = createFixture(tasks.MERGE_ATTENDANCE_POOLS.type)
    attendanceService.executeMergeEventPoolsTask.mockRejectedValue(error)

    await runTask()

    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "PENDING")
  })

  it("retries a transactional completion check after a Stripe timeout", async () => {
    const { client, transactionHandle, attendanceService, taskService, task, payload, runTask } = createFixture(
      tasks.VERIFY_ATTENDANCE_COMPLETION.type
    )
    const timeout = new Stripe.errors.StripeConnectionError({ message: "Request timed out" })
    attendanceService.executeVerifyAttendanceCompletionTask.mockRejectedValue(timeout)

    await runTask()

    expect(client.$transaction).toHaveBeenCalledOnce()
    expect(attendanceService.executeVerifyAttendanceCompletionTask).toHaveBeenCalledExactlyOnceWith(
      transactionHandle,
      payload
    )
    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "PENDING")
  })

  it("opens prepared checkouts outside a transaction through the payment workflow", async () => {
    const { client, paymentWorkflowService, taskService, task, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    paymentWorkflowService.openCheckout.mockResolvedValue(mock<PaymentRecord>({ attendeeId: "attendee" }))

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(paymentWorkflowService.openCheckout).toHaveBeenCalledExactlyOnceWith(client, "attempt")
    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "COMPLETED")
  })

  it("reschedules a failed checkout without discarding the persisted attempt", async () => {
    const { client, paymentWorkflowService, taskService, task, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    paymentWorkflowService.openCheckout.mockRejectedValue(new Error("Stripe unavailable"))

    await runTask()

    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "PENDING")
  })

  it("does not execute or acknowledge a checkout claimed by another worker", async () => {
    const { discoveryService, paymentWorkflowService, taskService, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    discoveryService.claimNextTask.mockReset().mockResolvedValue(null)

    await runTask()

    expect(paymentWorkflowService.openCheckout).not.toHaveBeenCalled()
    expect(taskService.finishTask).not.toHaveBeenCalled()
  })

  it("keeps attendance pool changes inside a transaction", async () => {
    const { client, transactionHandle, attendanceService, taskService, task, payload, runTask } = createFixture(
      tasks.MERGE_ATTENDANCE_POOLS.type
    )

    await runTask()

    expect(client.$transaction).toHaveBeenCalledOnce()
    expect(attendanceService.executeMergeEventPoolsTask).toHaveBeenCalledExactlyOnceWith(transactionHandle, payload)
    expect(taskService.finishTask).toHaveBeenCalledExactlyOnceWith(client, task, "COMPLETED")
  })
})
