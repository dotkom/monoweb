import type { DBClient, DBHandle } from "@dotkomonline/db"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import Stripe from "stripe"
import { addMinutes } from "date-fns"
import type { Configuration } from "../../configuration"
import { TaskSkippedError } from "../../error"
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
  const pendingTasks = [task]
  discoveryService.claimNextTask.mockImplementation(async (taskTypes) => {
    const index = pendingTasks.findIndex((pendingTask) => taskTypes.includes(pendingTask.type))

    if (index === -1) {
      return null
    }

    return pendingTasks.splice(index, 1)[0]
  })
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

  async function runTask(pollCount = 1) {
    executor.startWorker(client, controller.signal)

    try {
      await vi.advanceTimersByTimeAsync(configuration.tasks.workerInterval * pollCount)
    } finally {
      controller.abort()
    }
  }

  return {
    client,
    transactionHandle,
    pendingTasks,
    task,
    discoveryService,
    attendanceService,
    paymentWorkflowService,
    taskService,
    payload,
    runTask,
    claimedAt,
  }
}

describe("task executor transaction boundaries", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("drains due completion checks while a checkout is still running", async () => {
    const { attendanceService, paymentWorkflowService, pendingTasks, task, runTask, taskService } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    const checkout = Promise.withResolvers<PaymentRecord>()
    const feedback = Promise.withResolvers<void>()
    paymentWorkflowService.openCheckout.mockReturnValue(checkout.promise)
    attendanceService.executeVerifyFeedbackAnsweredTask.mockReturnValue(feedback.promise)
    pendingTasks.push({ ...task, id: "feedback", type: "VERIFY_FEEDBACK_ANSWERED" })
    pendingTasks.push({ ...task, id: "another-checkout" })

    // The deadlines become due after the first poll starts the checkout.
    setTimeout(() => {
      pendingTasks.push(
        { ...task, id: "first-deadline", type: "VERIFY_ATTENDANCE_COMPLETION" },
        { ...task, id: "second-deadline", type: "VERIFY_ATTENDANCE_COMPLETION" }
      )
    }, 150)

    try {
      await runTask(2)

      expect(paymentWorkflowService.openCheckout).toHaveBeenCalledTimes(1)
      expect(attendanceService.executeVerifyFeedbackAnsweredTask).toHaveBeenCalledOnce()
      expect(attendanceService.executeVerifyAttendanceCompletionTask).toHaveBeenCalledTimes(2)
      expect(pendingTasks.map((pendingTask) => pendingTask.id)).toEqual(["another-checkout"])
    } finally {
      checkout.resolve(mock<PaymentRecord>())
      feedback.resolve()
    }

    await vi.advanceTimersByTimeAsync(100)
    expect(taskService.finishCheckoutTask).toHaveBeenCalledOnce()
    expect(paymentWorkflowService.openCheckout).toHaveBeenCalledTimes(1)
  })

  it("captures payments without an enclosing transaction and marks the task completed", async () => {
    const { client, attendanceService, taskService, payload, runTask } = createFixture()

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(attendanceService.executeChargeAttendeeTask).toHaveBeenCalledExactlyOnceWith(client, payload)
    expect(taskService.setTaskExecutionStatus.mock.calls).toEqual([[client, "task", "COMPLETED", "RUNNING"]])
  })

  it.each([
    { error: new Error("Stripe unavailable"), expectedStatus: "FAILED" },
    { error: new TaskSkippedError("Attempt was replaced"), expectedStatus: "SKIPPED" },
  ])("records $expectedStatus when capture does not complete", async ({ error, expectedStatus }) => {
    const { client, attendanceService, taskService, runTask } = createFixture()
    attendanceService.executeChargeAttendeeTask.mockRejectedValue(error)

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(taskService.setTaskExecutionStatus.mock.calls).toEqual([[client, "task", expectedStatus, "RUNNING"]])
  })

  it("retries a completion check after a Stripe timeout without wrapping the check in a transaction", async () => {
    const { client, attendanceService, taskService, payload, runTask } = createFixture(
      tasks.VERIFY_ATTENDANCE_COMPLETION.type
    )
    const timeout = new Stripe.errors.StripeConnectionError({ message: "Request timed out" })
    attendanceService.executeVerifyAttendanceCompletionTask.mockRejectedValue(timeout)

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(attendanceService.executeVerifyAttendanceCompletionTask).toHaveBeenCalledExactlyOnceWith(client, payload)
    expect(taskService.update).toHaveBeenCalledExactlyOnceWith(
      client,
      "task",
      {
        status: "PENDING",
        scheduledAt: addMinutes(new Date(), 1),
        processedAt: null,
      },
      "RUNNING"
    )
    expect(taskService.setTaskExecutionStatus).not.toHaveBeenCalled()
  })

  it("opens prepared checkouts outside a transaction through the payment workflow", async () => {
    const { client, paymentWorkflowService, taskService, claimedAt, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    paymentWorkflowService.openCheckout.mockResolvedValue(mock<PaymentRecord>({ attendeeId: "attendee" }))

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(paymentWorkflowService.openCheckout).toHaveBeenCalledExactlyOnceWith(client, "attempt")
    expect(taskService.finishCheckoutTask).toHaveBeenCalledExactlyOnceWith(client, "task", claimedAt, {
      status: "COMPLETED",
      processedAt: expect.any(Date),
    })
  })

  it("reschedules a failed checkout without discarding the persisted attempt", async () => {
    const { client, paymentWorkflowService, taskService, claimedAt, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    paymentWorkflowService.openCheckout.mockRejectedValue(new Error("Stripe unavailable"))

    await runTask()

    expect(taskService.finishCheckoutTask).toHaveBeenCalledExactlyOnceWith(client, "task", claimedAt, {
      status: "PENDING",
      scheduledAt: expect.any(Date),
      processedAt: null,
    })
    expect(taskService.setTaskExecutionStatus).not.toHaveBeenCalledWith(client, "task", "COMPLETED", "RUNNING")
  })

  it("does not execute or acknowledge a checkout claimed by another worker", async () => {
    const { discoveryService, paymentWorkflowService, taskService, runTask } = createFixture(
      tasks.OPEN_PAYMENT_CHECKOUT.type
    )
    discoveryService.claimNextTask.mockReset().mockResolvedValue(null)

    await runTask()

    expect(paymentWorkflowService.openCheckout).not.toHaveBeenCalled()
    expect(taskService.finishCheckoutTask).not.toHaveBeenCalled()
  })

  it("keeps attendance pool changes inside a transaction", async () => {
    const { client, transactionHandle, attendanceService, taskService, payload, runTask } = createFixture(
      tasks.MERGE_ATTENDANCE_POOLS.type
    )

    await runTask()

    expect(client.$transaction).toHaveBeenCalledOnce()
    expect(attendanceService.executeMergeEventPoolsTask).toHaveBeenCalledExactlyOnceWith(transactionHandle, payload)
    expect(taskService.setTaskExecutionStatus).toHaveBeenLastCalledWith(client, "task", "COMPLETED", "RUNNING")
  })
})
