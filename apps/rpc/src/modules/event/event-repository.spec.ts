import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it, vi } from "vitest"
import { DeregisterReasonWriteSchema } from "./event"
import { getEventRepository } from "./event-repository"

describe("deregistration reasons after event deletion", () => {
  const deregisterReason = {
    id: "reason-1",
    createdAt: new Date("2026-10-01T10:00:00Z"),
    registeredAt: new Date("2026-09-30T10:00:00Z"),
    type: "SCHOOL",
    details: "Schedule conflict",
    userGrade: 2,
    userId: "user-1",
    eventId: null,
    event: null,
  }

  it("returns the retained reason when its event no longer exists", async () => {
    const handle = {
      deregisterReason: {
        findMany: vi.fn().mockResolvedValue([deregisterReason]),
      },
    } as unknown as DBHandle

    const reasons = await getEventRepository().findManyDeregisterReasonsWithEvent(handle, {})

    expect(reasons).toEqual([deregisterReason])
  })

  it("still requires an event when creating a new reason", () => {
    expect(DeregisterReasonWriteSchema.safeParse(deregisterReason).success).toBe(false)
    expect(DeregisterReasonWriteSchema.safeParse({ ...deregisterReason, eventId: "event-1" }).success).toBe(true)
  })
})
