import { randomUUID } from "node:crypto"
import type { Group } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { GroupNotFoundError } from "../group-error"
import { GroupRepositoryImpl } from "../group-repository"
import { GroupServiceImpl } from "../group-service"

describe("GroupService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const groupRepository = new GroupRepositoryImpl(db)
  const groupService = new GroupServiceImpl(groupRepository)

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
    const created = await groupService.createGroup(group)
    expect(created).toEqual({ id, ...group })
    expect(groupRepository.create).toHaveBeenCalledWith(group)
  })

  it("does not find non-existent committees", async () => {
    const id = randomUUID()
    vi.spyOn(groupRepository, "getById").mockResolvedValueOnce(null)
    await expect(async () => groupService.getGroup(id)).rejects.toThrowError(GroupNotFoundError)
  })
})
