import type { DBClient, DBHandle } from "@dotkomonline/db"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { Configuration } from "../../configuration"
import { TaskSkippedError } from "../../error"
import type { PaymentWorkflowService } from "../payment/payment-workflow-service"
import type { PaymentRecord } from "../payment/payment"
import type { AttendanceService } from "../event/attendance-service"
import type { RecurringTaskService } from "./recurring-task-service"
import type { Task } from "./task"
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
  const task = mock<Task>({ id: "task", type, payload })
  const configuration = mock<Configuration>({
    tasks: {
      workerInterval: 100,
    },
  })

  discoveryService.querySchedulableRecurringTasks.mockResolvedValue([])
  discoveryService.queryNextTask.mockResolvedValueOnce(task).mockResolvedValue(null)
  taskService.parse.mockReturnValue(payload)
  const claimedAt = new Date()
  taskService.claimCheckoutTask.mockResolvedValue(claimedAt)
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

  it("captures payments without an enclosing transaction and marks the task completed", async () => {
    const { client, attendanceService, taskService, payload, runTask } = createFixture()

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(attendanceService.executeChargeAttendeeTask).toHaveBeenCalledExactlyOnceWith(client, payload)
    expect(taskService.setTaskExecutionStatus.mock.calls).toEqual([
      [client, "task", "RUNNING", "PENDING"],
      [client, "task", "COMPLETED", "RUNNING"],
    ])
  })

  it.each([
    { error: new Error("Stripe unavailable"), expectedStatus: "FAILED" },
    { error: new TaskSkippedError("Attempt was replaced"), expectedStatus: "SKIPPED" },
  ])("records $expectedStatus when capture does not complete", async ({ error, expectedStatus }) => {
    const { client, attendanceService, taskService, runTask } = createFixture()
    attendanceService.executeChargeAttendeeTask.mockRejectedValue(error)

    await runTask()

    expect(client.$transaction).not.toHaveBeenCalled()
    expect(taskService.setTaskExecutionStatus.mock.calls).toEqual([
      [client, "task", "RUNNING", "PENDING"],
      [client, "task", expectedStatus, "RUNNING"],
    ])
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
    const { paymentWorkflowService, taskService, runTask } = createFixture(tasks.OPEN_PAYMENT_CHECKOUT.type)
    taskService.claimCheckoutTask.mockResolvedValue(null)

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
