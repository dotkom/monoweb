import type { DBHandle } from "@dotkomonline/db"
import type { Principal, TRPCContext } from "../../../trpc"
import { groupRouter } from "../group-router"

describe("group router principal forwarding", () => {
  it("routes anonymous non-Hovedstyret getMembers to getLeader", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      getLeader: vi.fn().mockResolvedValue([]),
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

    expect(groupService.getLeader).toHaveBeenCalledWith(txHandle, "dotkom")
    expect(groupService.getMembers).not.toHaveBeenCalled()
  })

  it("routes anonymous Hovedstyret getMembers to getMembers", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      getLeader: vi.fn(),
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

    expect(groupService.getMembers).toHaveBeenCalledWith(txHandle, "hs", null)
    expect(groupService.getLeader).not.toHaveBeenCalled()
  })

  it("passes authenticated principal to getMember", async () => {
    const txHandle = {} as DBHandle
    const principal = {
      subject: "user-1",
      affiliations: new Map(),
    } as Principal
    const groupService = {
      getMembers: vi.fn(),
      getMember: vi.fn().mockResolvedValue({}),
    }

    const ctx = {
      principal,
      prisma: {
        $transaction: vi.fn(async (fn: (handle: DBHandle) => Promise<unknown>) => await fn(txHandle)),
      },
      groupService,
      addAuthorizationGuard: vi.fn(),
    } as unknown as TRPCContext

    const caller = groupRouter.createCaller(ctx)

    await caller.getMember({ groupId: "dotkom", userId: "user-1" })

    expect(groupService.getMember).toHaveBeenCalledWith(txHandle, "dotkom", "user-1", principal)
  })
})
