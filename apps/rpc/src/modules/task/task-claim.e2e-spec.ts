import { describe, expect, it } from "vitest"
import { core, dbClient } from "../../../vitest-integration.setup"

describe("claiming due tasks", () => {
  it("skips a task locked by another worker and claims only eligible rows", async () => {
    const overdue = new Date(Date.now() - 60 * 60_000)
    const future = new Date(Date.now() + 60 * 60_000)

    await dbClient.task.createMany({
      data: [
        { id: "first", type: "CHARGE_ATTENDEE", scheduledAt: overdue },
        { id: "second", type: "VERIFY_ATTENDANCE_COMPLETION", scheduledAt: new Date() },
        { id: "future", type: "CHARGE_ATTENDEE", scheduledAt: future },
        { id: "running", type: "CHARGE_ATTENDEE", status: "RUNNING", scheduledAt: overdue, processedAt: overdue },
        {
          id: "completed",
          type: "OPEN_PAYMENT_CHECKOUT",
          status: "COMPLETED",
          scheduledAt: overdue,
          processedAt: overdue,
        },
      ],
    })

    await dbClient.$transaction(async (handle) => {
      const first = await core.taskService.claimNextTask(handle)
      expect(first).toMatchObject({ id: "first", status: "RUNNING", processedAt: expect.any(Date) })

      // The first connection still holds the row lock while the second worker polls.
      const second = await core.taskService.claimNextTask(dbClient)
      expect(second).toMatchObject({ id: "second", status: "RUNNING", processedAt: expect.any(Date) })
    })

    expect(await core.taskService.claimNextTask(dbClient)).toBeNull()
  })
})
