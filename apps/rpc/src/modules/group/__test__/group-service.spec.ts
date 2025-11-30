import { randomUUID } from "node:crypto"
import type { S3Client } from "@aws-sdk/client-s3"
import type { Group } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import type { ManagementClient } from "auth0"
import { getFeideGroupsRepository } from "src/modules/feide/feide-groups-repository"
import { getMembershipService } from "src/modules/user/membership-service"
import { getUserRepository } from "src/modules/user/user-repository"
import { getUserService } from "src/modules/user/user-service"
import { mockDeep } from "vitest-mock-extended"
import { NotFoundError } from "../../../error"
import { getGroupRepository } from "../group-repository"
import { getGroupService } from "../group-service"

describe("GroupService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const auth0Client = mockDeep<ManagementClient>()
  const s3Client = mockDeep<S3Client>()
  const userRepository = getUserRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const membershipService = getMembershipService()

  const userService = getUserService(
    userRepository,
    feideGroupsRepository,
    auth0Client,
    membershipService,
    s3Client,
    "fake-aws-bucket"
  )

  const groupRepository = getGroupRepository()
  const groupService = getGroupService(groupRepository, userService, s3Client, "fake-aws-bucket")

  it("creates a new group", async () => {
    const group: Omit<Group, "id"> = {
      slug: "dotkom",
      abbreviation: "Dotkom",
      name: "Drifts- og utviklingskomiteen",
      createdAt: new Date(),
      description: "Dotkom er har ansvaret for å gjøre ting",
      email: "dotkom@online.ntnu.no",
      imageUrl: null,
      type: "COMMITTEE",
      memberVisibility: "ALL_MEMBERS",
      shortDescription: null,
      contactUrl: null,
      deactivatedAt: null,
      roles: [],
      workspaceGroupId: null,
      showLeaderAsContact: false,
      recruitmentMethod: "AUTUMN_APPLICATION",
    }
    const id = randomUUID()
    vi.spyOn(groupRepository, "create").mockResolvedValueOnce({ ...group })
    const created = await groupService.create(db, group)
    expect(created).toEqual({ id, ...group })
    expect(groupRepository.create).toHaveBeenCalledWith(db, group)
  })

  it("does not find non-existent committees", async () => {
    const id = randomUUID()
    vi.spyOn(groupRepository, "findBySlug").mockResolvedValueOnce(null)
    await expect(async () => groupService.findBySlug(db, id)).rejects.toThrowError(NotFoundError)
  })
})
