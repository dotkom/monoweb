import type { DBHandle } from "@dotkomonline/db"
import type { Principal, TRPCContext } from "src/trpc"
import { groupRouter } from "../group-router"

describe("group router principal forwarding", () => {
  it("passes anonymous principal to getMembers", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
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

    await caller.getMembers("dotkom")

    expect(groupService.getMembers).toHaveBeenCalledWith(txHandle, "dotkom", null)
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
