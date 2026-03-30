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

  it("queries all memberships for a group when userId is not provided", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "dotkom")

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

  it("filters memberships by user when userId is provided", async () => {
    const { handle, findMany } = createHandle()

    await groupRepository.findManyGroupMemberships(handle, "dotkom", "user-1")

    expect(findMany).toHaveBeenCalledWith({
      where: {
        groupId: "dotkom",
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
