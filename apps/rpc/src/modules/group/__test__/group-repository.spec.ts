import type { DBHandle } from "@dotkomonline/db"
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

  it("only shows leaders to non-authenticated users", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "dotkom", undefined, {
      isAuthenticated: false,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: "dotkom",
        roles: {
          some: {
            role: {
              type: "LEADER",
            },
          },
        },
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

  it("does not filter members for anonymous Hovedstyret requests", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "hs", undefined, {
      isAuthenticated: false,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: "hs",
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

  it("does not filter members for authenticated requests", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "dotkom", undefined, {
      isAuthenticated: true,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: "dotkom",
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

  it("combines user filtering with leader filtering for anonymous requests", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "dotkom", "user-1", {
      isAuthenticated: false,
    })

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: "dotkom",
        userId: "user-1",
        roles: {
          some: {
            role: {
              type: "LEADER",
            },
          },
        },
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
