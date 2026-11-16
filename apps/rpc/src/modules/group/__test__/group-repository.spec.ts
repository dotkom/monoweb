import type { DBHandle } from "@dotkomonline/db"
import { mockDeep } from "vitest-mock-extended"
import { CommitteeGroupSlug } from "../../authorization-service"
import { getGroupRepository } from "../group-repository"

describe("GroupRepository.findManyGroupMemberships", () => {
  const groupRepository = getGroupRepository()

  const createHandle = () => {
    const findMany = vi.fn().mockResolvedValue([])
    const handle = {
      groupMembership: {
        findMany,
      },
    } as unknown as DBHandle

    return { handle, findMany }
  }

  it("queries all memberships for a group when userId is not provided", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, CommitteeGroupSlug.DOTKOM, null)

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: CommitteeGroupSlug.DOTKOM,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })
  })

  it("filters memberships by user when userId is provided", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, CommitteeGroupSlug.DOTKOM, "user-1")

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: CommitteeGroupSlug.DOTKOM,
        userId: "user-1",
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })
  })
})

describe("GroupRepository.findActiveGroupMembership", () => {
  const groupRepository = getGroupRepository()

  it("finds the active membership for the user and group and includes its roles", async () => {
    const handle = mockDeep<DBHandle>()
    const role = {
      id: "leader-role",
      groupId: CommitteeGroupSlug.DOTKOM,
      name: "Leader",
      type: "LEADER" as const,
      isDefault: false,
    }
    const membership = {
      id: "active-membership",
      groupId: CommitteeGroupSlug.DOTKOM,
      userId: "user-1",
      start: new Date("2026-01-01"),
      end: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    }

    const membershipWithRoles = {
      ...membership,
      roles: [{ membershipId: membership.id, roleId: role.id, role }],
    }

    handle.groupMembership.findFirst.mockResolvedValue(membershipWithRoles)

    const result = await groupRepository.findActiveGroupMembership(handle, CommitteeGroupSlug.DOTKOM, "user-1")

    expect(result).toEqual({
      ...membership,
      roles: [role],
    })
    expect(handle.groupMembership.findFirst).toHaveBeenCalledWith({
      where: {
        groupId: CommitteeGroupSlug.DOTKOM,
        userId: "user-1",
        end: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })
  })

  it("returns null when the user has no active membership in the group", async () => {
    const handle = mockDeep<DBHandle>()
    handle.groupMembership.findFirst.mockResolvedValue(null)

    const result = await groupRepository.findActiveGroupMembership(handle, CommitteeGroupSlug.DOTKOM, "user-1")

    expect(result).toBeNull()
  })
})
