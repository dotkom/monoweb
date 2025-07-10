import { randomUUID } from "node:crypto"
import type { Group } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { GroupNotFoundError } from "../group-error"
import { getGroupRepository } from "../group-repository"
import { getGroupService } from "../group-service"

describe("GroupService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const groupRepository = getGroupRepository()
  const groupService = getGroupService(groupRepository)

  it("creates a new group", async () => {
    const group: Omit<Group, "id"> = {
      name: "Dotkom",
      createdAt: new Date(),
      description: "Dotkom gjør ting",
      longDescription: "Ting skjer",
      email: "dotkom@online.ntnu.no",
      image: null,
      type: "COMMITTEE",
    }
    const id = randomUUID()
    vi.spyOn(groupRepository, "create").mockResolvedValueOnce({ id, ...group })
    const created = await groupService.create(db, group)
    expect(created).toEqual({ id, ...group })
    expect(groupRepository.create).toHaveBeenCalledWith(db, group)
  })

  it("does not find non-existent committees", async () => {
    const id = randomUUID()
    vi.spyOn(groupRepository, "getById").mockResolvedValueOnce(null)
    await expect(async () => groupService.getById(db, id)).rejects.toThrowError(GroupNotFoundError)
  })
})
