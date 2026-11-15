import type { DBHandle } from "@dotkomonline/db"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { Task } from "./task"
import type { TaskRepository } from "./task-repository"
import { getTaskService } from "./task-service"

const now = new Date("2026-11-14T10:00:00Z")

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "checkout",
    type: "OPEN_PAYMENT_CHECKOUT",
    status: "PENDING",
    processedAt: null,
    createdAt: now,
    scheduledAt: now,
    recurringTaskId: null,
    payload: {},
    ...overrides,
  }
}

describe("checkout task recovery", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    { description: "pending", status: "PENDING" as const, processedAt: null },
    { description: "abandoned", status: "RUNNING" as const, processedAt: new Date("2026-11-14T09:55:00Z") },
  ])("claims a $description checkout only if its observed execution is still current", async ({
    status,
    processedAt,
  }) => {
    const repository = mock<TaskRepository>()
    const service = getTaskService(repository)
    const handle = mock<DBHandle>()
    const task = createTask({ status, processedAt })
    repository.update.mockResolvedValueOnce(task).mockResolvedValueOnce(null)

    expect(await service.claimCheckoutTask(handle, task)).toEqual(now)
    expect(await service.claimCheckoutTask(handle, task)).toBeNull()
    expect(repository.update).toHaveBeenCalledWith(
      handle,
      task.id,
      {
        status: "RUNNING",
        processedAt: now,
      },
      status,
      processedAt
    )
  })

  it.each([
    {
      type: "OPEN_PAYMENT_CHECKOUT" as const,
      status: "RUNNING" as const,
      processedAt: new Date("2026-11-14T09:59:00Z"),
    },
    {
      type: "OPEN_PAYMENT_CHECKOUT" as const,
      status: "COMPLETED" as const,
      processedAt: new Date("2026-11-14T09:00:00Z"),
    },
    { type: "CHARGE_ATTENDEE" as const, status: "RUNNING" as const, processedAt: new Date("2026-11-14T09:00:00Z") },
  ])("does not reclaim $type in $status with a protected execution", async (state) => {
    const repository = mock<TaskRepository>()
    const service = getTaskService(repository)
    const task = createTask(state)

    expect(await service.claimCheckoutTask(mock<DBHandle>(), task)).toBeNull()
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("fences completion and retry updates to the worker's original claim", async () => {
    const repository = mock<TaskRepository>()
    const service = getTaskService(repository)
    const handle = mock<DBHandle>()
    repository.update.mockResolvedValue(null)

    await service.finishCheckoutTask(handle, "task", now, { status: "COMPLETED" })
    await service.finishCheckoutTask(handle, "task", now, { status: "PENDING", processedAt: null })

    expect(repository.update.mock.calls).toEqual([
      [handle, "task", { status: "COMPLETED" }, "RUNNING", now],
      [handle, "task", { status: "PENDING", processedAt: null }, "RUNNING", now],
    ])
  })
})
