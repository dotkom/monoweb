import type { DBHandle } from "@dotkomonline/db"
import type { Rule, RuleContext } from "../../../authorization"
import { ForbiddenError } from "../../../error"
import type { TRPCContext } from "../../../trpc"
import { CommitteeGroupSlug } from "../../authorization-service"
import { type GroupRoleType, type GroupType, GroupRoleTypeEnum } from "../group"
import { groupRouter } from "../group-router"

describe("group router service forwarding", () => {
  it("routes anonymous non-Hovedstyret getMembers to findLeadersBySlug", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      findLeadersBySlug: vi.fn().mockResolvedValue(new Map()),
      findMembersBySlug: vi.fn(),
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

    await caller.getMembers(CommitteeGroupSlug.DOTKOM)

    expect(groupService.findLeadersBySlug).toHaveBeenCalledWith(txHandle, CommitteeGroupSlug.DOTKOM)
    expect(groupService.findMembersBySlug).not.toHaveBeenCalled()
  })

  it("routes anonymous Hovedstyret getMembers to findMembersBySlug", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      findLeadersBySlug: vi.fn(),
      findMembersBySlug: vi.fn().mockResolvedValue(new Map()),
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

    await caller.getMembers(CommitteeGroupSlug.HOVEDSTYRET)

    expect(groupService.findMembersBySlug).toHaveBeenCalledWith(txHandle, CommitteeGroupSlug.HOVEDSTYRET)
    expect(groupService.findLeadersBySlug).not.toHaveBeenCalled()
  })

  it("passes through group and user ids to getMember", async () => {
    const txHandle = {} as DBHandle
    const groupService = {
      findMembersBySlug: vi.fn(),
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

    await caller.getMember({ groupId: CommitteeGroupSlug.DOTKOM, userId: "user-1" })

    expect(groupService.getMember).toHaveBeenCalledWith(txHandle, CommitteeGroupSlug.DOTKOM, "user-1")
  })
})

const membershipId = "membership-id"
const roleId = "role-id"
const groupSlug = "target-group"
function createPermissionContext(affiliations: Map<string, Set<GroupRoleType>>, type: GroupType = "COMMITTEE") {
  const group = {
    slug: groupSlug,
    name: "Target group",
    type,
    roles: [{ id: roleId, groupId: groupSlug, name: "Member", type: GroupRoleTypeEnum.COSMETIC }],
  }
  const handle = {
    $executeRaw: vi.fn().mockResolvedValue(0),
    auditTransaction: {
      create: vi.fn().mockResolvedValue({ id: "audit-id" }),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as DBHandle
  const groupService = {
    getBySlug: vi.fn(async (_handle: DBHandle, slug: string) => ({ ...group, slug })),
    getByGroupMembershipId: vi.fn().mockResolvedValue(group),
    getByGroupRoleId: vi.fn().mockResolvedValue(group),
    getMembershipById: vi.fn().mockResolvedValue({ id: membershipId, groupId: groupSlug, userId: "other-user" }),
    delete: vi.fn().mockResolvedValue(group),
    deleteManyGroupMemberships: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(group),
    startMembership: vi.fn().mockResolvedValue({ id: "other-user", name: "Other user" }),
    getMember: vi.fn().mockResolvedValue({}),
    allMembershipsByUserId: vi.fn().mockResolvedValue([]),
    updateMembership: vi.fn().mockResolvedValue({ id: membershipId, userId: "other-user" }),
    updateRole: vi.fn().mockResolvedValue({ id: roleId, name: "Member" }),
    deleteRole: vi.fn().mockResolvedValue(undefined),
  }
  const ctx = {
    principal: { subject: "caller", affiliations, scopes: new Set<string>() },
    prisma: { $transaction: vi.fn(async (fn: (handle: DBHandle) => Promise<unknown>) => await fn(handle)) },
    groupService,
    userService: { getById: vi.fn().mockResolvedValue({ id: "other-user", name: "Other user" }) },
  } as unknown as TRPCContext
  const evaluate = <TInput>(rule: Rule<TInput>, context: RuleContext<TInput>) => rule.evaluate(context)
  ctx.addAuthorizationGuard = async (rule, input) => {
    if (!(await evaluate(rule, { input, principal: ctx.principal, ctx, evaluate }))) {
      throw new ForbiddenError("Denied")
    }
  }

  return { caller: groupRouter.createCaller(ctx), groupService, ctx, group }
}

describe("authorization against the owning group", () => {
  it.each([
    GroupRoleTypeEnum.LEADER,
    GroupRoleTypeEnum.DEPUTY_LEADER,
  ])("allows the owning group's %s to edit records", async (role) => {
    const { caller, groupService } = createPermissionContext(new Map([[groupSlug, new Set([role])]]))
    await caller.updateMembership({
      id: membershipId,
      data: { groupId: groupSlug, userId: "other-user", start: new Date("2026-01-01"), end: null },
      roleIds: [],
    })
    await caller.updateRole({
      id: roleId,
      role: { groupId: groupSlug, name: "Member", type: GroupRoleTypeEnum.COSMETIC },
    })
    expect(groupService.updateMembership).toHaveBeenCalledOnce()
    expect(groupService.updateRole).toHaveBeenCalledOnce()
  })

  it.each([
    "membership",
    "role",
  ] as const)("requires manager access to the destination when moving a %s", async (record) => {
    const { caller, groupService } = createPermissionContext(
      new Map([[groupSlug, new Set([GroupRoleTypeEnum.LEADER])]])
    )
    const move =
      record === "membership"
        ? caller.updateMembership({
            id: membershipId,
            data: {
              groupId: CommitteeGroupSlug.HOVEDSTYRET,
              userId: "caller",
              start: new Date("2026-01-01"),
              end: null,
            },
            roleIds: [],
          })
        : caller.updateRole({
            id: roleId,
            role: { groupId: CommitteeGroupSlug.HOVEDSTYRET, name: "Member", type: GroupRoleTypeEnum.COSMETIC },
          })
    await expect(move).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(groupService.updateMembership).not.toHaveBeenCalled()
    expect(groupService.updateRole).not.toHaveBeenCalled()
  })

  it("does not treat membership or role IDs as group slugs", async () => {
    const { caller, groupService } = createPermissionContext(
      new Map([
        [membershipId, new Set([GroupRoleTypeEnum.LEADER])],
        [roleId, new Set([GroupRoleTypeEnum.LEADER])],
      ])
    )
    await expect(
      caller.updateMembership({
        id: membershipId,
        data: { groupId: groupSlug, userId: "other-user", start: new Date("2026-01-01"), end: null },
        roleIds: [],
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    await expect(
      caller.updateRole({ id: roleId, role: { groupId: groupSlug, name: "Member", type: GroupRoleTypeEnum.COSMETIC } })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    await expect(caller.deleteRole(roleId)).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(groupService.updateMembership).not.toHaveBeenCalled()
    expect(groupService.updateRole).not.toHaveBeenCalled()
    expect(groupService.deleteRole).not.toHaveBeenCalled()
  })

  it("authorizes membership deletion against its stored group rather than a supplied group", async () => {
    const { caller, groupService } = createPermissionContext(
      new Map([["another-group", new Set([GroupRoleTypeEnum.LEADER])]])
    )
    await expect(caller.deleteGroupMembership({ id: membershipId, groupId: "another-group" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    })
    expect(groupService.getBySlug).toHaveBeenCalledWith(expect.anything(), groupSlug)
    expect(groupService.deleteManyGroupMemberships).not.toHaveBeenCalled()
  })
})
