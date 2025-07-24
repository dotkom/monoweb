import { randomUUID } from "node:crypto"
import type { Group } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { ManagementClient } from "auth0"
import { getFeideGroupsRepository } from "src/modules/feide/feide-groups-repository"
import { getNTNUStudyplanRepository } from "src/modules/ntnu-study-plan/ntnu-study-plan-repository"
import { getNotificationPermissionsRepository } from "src/modules/user/notification-permissions-repository"
import { getPrivacyPermissionsRepository } from "src/modules/user/privacy-permissions-repository"
import { getUserRepository } from "src/modules/user/user-repository"
import { getUserService } from "src/modules/user/user-service"
import { GroupNotFoundError } from "../group-error"
import { getGroupRepository } from "../group-repository"
import { getGroupService } from "../group-service"

describe("GroupService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  // i dont think this works
  const auth0Client = vi.mocked(ManagementClient.prototype)

  const userRepository = getUserRepository(auth0Client)
  const privacyPermissionsRepository = getPrivacyPermissionsRepository()
  const notificationPermissionsRepository = getNotificationPermissionsRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const ntnuStudyplanRepository = getNTNUStudyplanRepository()

  const userService = getUserService(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    feideGroupsRepository,
    ntnuStudyplanRepository
  )

  const groupRepository = getGroupRepository()
  const groupService = getGroupService(groupRepository, userService)

  it("creates a new group", async () => {
    const group: Omit<Group, "id"> = {
      name: "Dotkom",
      fullName: "Drifts- og utviklingskomiteen",
      createdAt: new Date(),
      description: "Dotkom er har ansvaret for å gjøre ting",
      shortDescription: "Dotkom gjør ting",
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
