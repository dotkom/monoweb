import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import type { ClaimedTask } from "./task"
import type { TaskRepository } from "./task-repository"
import { getTaskService } from "./task-service"

const now = new Date("2026-11-14T10:00:00Z")

describe("checkout task recovery", () => {
  it("fences completion and retry updates to the worker's original claim", async () => {
    const repository = mock<TaskRepository>()
    const service = getTaskService(repository)
    const handle = mock<DBHandle>()
    repository.update.mockResolvedValue(null)

    const claimedAt = new Date("2026-11-14T09:59:00Z")
    const task = { ...mock<ClaimedTask>(), id: "task", processedAt: claimedAt }
    vi.useFakeTimers()
    vi.setSystemTime(now)

    try {
      await service.finishTask(handle, task, "COMPLETED")
      await service.finishTask(handle, task, "PENDING")

      expect(repository.update.mock.calls).toEqual([
        [handle, "task", { status: "COMPLETED", processedAt: now }, "RUNNING", claimedAt],
        [
          handle,
          "task",
          { status: "PENDING", processedAt: null, scheduledAt: new Date("2026-11-14T10:01:00Z") },
          "RUNNING",
          claimedAt,
        ],
      ])
    } finally {
      vi.useRealTimers()
    }
  })
})
