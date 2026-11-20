import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mock } from "vitest-mock-extended"
import type { TaskRepository } from "./task-repository"
import { getTaskService } from "./task-service"

const now = new Date("2026-11-14T10:00:00Z")

describe("checkout task recovery", () => {
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
