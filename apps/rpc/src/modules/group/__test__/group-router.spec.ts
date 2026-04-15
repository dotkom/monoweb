import type { DBHandle } from "@dotkomonline/db"
import type { TRPCContext } from "../../../trpc"
import { groupRouter } from "../group-router"

describe("group router service forwarding", () => {
  it("routes anonymous non-Hovedstyret getMembers to getLeaders", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      getLeaders: vi.fn().mockResolvedValue([]),
      getMembers: vi.fn(),
      getMember: vi.fn(),
    }

    const ctx = {
      principal: null,
      prisma: {
        $transaction: vi.fn(async (fn: (handle: DBHandle) => Promise<unknown>) => await fn(txHandle)),
      },
      groupService,
      addAuthorizationGuard: vi.fn(),
    } as unknown as TRPCContext

    const caller = groupRouter.createCaller(ctx)

    await caller.getMembers("dotkom")

    expect(groupService.getLeaders).toHaveBeenCalledWith(txHandle, "dotkom")
    expect(groupService.getMembers).not.toHaveBeenCalled()
  })

  it("routes anonymous Hovedstyret getMembers to getMembers", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      getLeaders: vi.fn(),
      getMembers: vi.fn().mockResolvedValue(new Map()),
      getMember: vi.fn(),
    }

    const ctx = {
      principal: null,
      prisma: {
        $transaction: vi.fn(async (fn: (handle: DBHandle) => Promise<unknown>) => await fn(txHandle)),
      },
      groupService,
      addAuthorizationGuard: vi.fn(),
    } as unknown as TRPCContext

    const caller = groupRouter.createCaller(ctx)

    await caller.getMembers("hs")

    expect(groupService.getMembers).toHaveBeenCalledWith(txHandle, "hs")
    expect(groupService.getLeaders).not.toHaveBeenCalled()
  })

  it("passes through group and user ids to getMember", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      getMembers: vi.fn(),
      getMember: vi.fn().mockResolvedValue({}),
    }

    const ctx = {
      principal: {
        subject: "user-1",
        affiliations: new Map(),
      },
      prisma: {
        $transaction: vi.fn(async (fn: (handle: DBHandle) => Promise<unknown>) => await fn(txHandle)),
      },
      groupService,
      addAuthorizationGuard: vi.fn(),
    } as unknown as TRPCContext

    const caller = groupRouter.createCaller(ctx)

    await caller.getMember({ groupId: "dotkom", userId: "user-1" })

    expect(groupService.getMember).toHaveBeenCalledWith(txHandle, "dotkom", "user-1")
  })
})
