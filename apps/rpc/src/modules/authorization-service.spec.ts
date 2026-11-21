import type { DBHandle } from "@dotkomonline/db"
import { getAuthorizationService } from "./authorization-service"
import { type GroupRoleType, GroupRoleTypeEnum } from "./group/group"

type Membership = { userId: string; groupId: string; start?: Date; end: Date | null; roles: GroupRoleType[] }

function createHandle(memberships: Membership[]) {
  return {
    group: {
      findMany: vi.fn().mockResolvedValue([
        {
          slug: "target-group",
          roles: [GroupRoleTypeEnum.COSMETIC, GroupRoleTypeEnum.LEADER, GroupRoleTypeEnum.DEPUTY_LEADER].map(
            (type) => ({
              type,
            })
          ),
        },
      ]),
    },
    groupMembership: {
      findMany: vi.fn(async ({ where }: { where: { userId: string; end: null; start: { lte: Date } } }) =>
        memberships
          .filter(
            (membership) =>
              membership.userId === where.userId &&
              membership.end === where.end &&
              (!membership.start || membership.start <= where.start.lte)
          )
          .map(({ groupId, roles }) => ({ groupId, roles: roles.map((type) => ({ role: { type } })) }))
      ),
    },
  } as unknown as DBHandle
}

describe("group affiliations", () => {
  it("only grants assigned roles and retains memberships without roles", async () => {
    const handle = createHandle([
      { userId: "user-1", groupId: "target-group", end: null, roles: [GroupRoleTypeEnum.COSMETIC] },
      { userId: "user-1", groupId: "backlog", end: null, roles: [] },
    ])
    expect(await getAuthorizationService().getGroupAffiliations(handle, "user-1")).toEqual(
      new Map([
        ["target-group", new Set([GroupRoleTypeEnum.COSMETIC])],
        ["backlog", new Set()],
      ])
    )
  })

  it("ignores another user's roles and memberships that have ended or not started", async () => {
    const handle = createHandle([
      { userId: "user-1", groupId: "arrkom", end: null, roles: [GroupRoleTypeEnum.COSMETIC] },
      { userId: "user-2", groupId: "arrkom", end: null, roles: [GroupRoleTypeEnum.LEADER] },
      { userId: "user-1", groupId: "arrkom", end: new Date("2026-01-01"), roles: [GroupRoleTypeEnum.DEPUTY_LEADER] },
      { userId: "user-1", groupId: "hs", start: new Date("2099-01-01"), end: null, roles: [] },
    ])
    expect(await getAuthorizationService().getGroupAffiliations(handle, "user-1")).toEqual(
      new Map([["arrkom", new Set([GroupRoleTypeEnum.COSMETIC])]])
    )
  })
})
