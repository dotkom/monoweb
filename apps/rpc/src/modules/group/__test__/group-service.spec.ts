import type { S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@dotkomonline/db"
import { getGroupDisplayName, getGroupSecondaryName, type Group } from "@dotkomonline/types"
import type { ManagementClient } from "auth0"
import { randomUUID } from "node:crypto"
import { getFeideGroupsRepository } from "../../feide/feide-groups-repository"
import { getMembershipService } from "../../user/membership-service"
import { getUserRepository } from "../../user/user-repository"
import { getUserService } from "../../user/user-service"
import { mockDeep } from "vitest-mock-extended"
import { CommitteeGroupSlug } from "../../authorization-service"
import { getGroupRepository } from "../group-repository"
import { getGroupService } from "../group-service"
import { describe, expect, it, vi } from "vitest"

describe("GroupService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const auth0Client = mockDeep<ManagementClient>()
  const s3Client = mockDeep<S3Client>()
  const userRepository = getUserRepository()
  const feideGroupsRepository = getFeideGroupsRepository()
  const groupRepository = getGroupRepository()
  const membershipService = getMembershipService()

  const userService = getUserService(
    userRepository,
    feideGroupsRepository,
    auth0Client,
    membershipService,
    s3Client,
    "fake-aws-bucket"
  )

  const groupService = getGroupService(groupRepository, userService, s3Client, "fake-aws-bucket")

  it("creates a new group", async () => {
    const group: Omit<Group, "id"> = {
      slug: CommitteeGroupSlug.DOTKOM,
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
      slackUrl: null,
      deactivatedAt: null,
      roles: [],
      workspaceGroupId: null,
      showLeaderAsContact: false,
      recruitmentMethod: "AUTUMN_APPLICATION",
      preferredDisplayName: "ABBREVIATION",
    }
    vi.spyOn(groupRepository, "findBySlug")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...group })
    vi.spyOn(groupRepository, "create").mockResolvedValueOnce({ ...group })
    vi.spyOn(groupRepository, "createGroupRoles").mockResolvedValueOnce([])

    const created = await groupService.create(db, group)
    expect(created).toEqual(group)
    expect(groupRepository.create).toHaveBeenCalledWith(db, CommitteeGroupSlug.DOTKOM, group)
  })

  it("resolves display name from preferred display name setting", () => {
    const group = {
      abbreviation: "Appkom",
      name: "Applikasjonskomiteen",
      preferredDisplayName: "ABBREVIATION",
    } as const

    expect(getGroupDisplayName(group)).toBe("Appkom")
    expect(getGroupSecondaryName(group)).toBe("Applikasjonskomiteen")
  })

  it("prefers official name when configured", () => {
    const group = {
      abbreviation: "Backlog",
      name: "Backlog",
      preferredDisplayName: "NAME",
    } as const

    expect(getGroupDisplayName(group)).toBe("Backlog")
    expect(getGroupSecondaryName(group)).toBeNull()
  })

  it("does not find non-existent committees", async () => {
    const id = randomUUID()
    vi.spyOn(groupRepository, "findBySlug").mockResolvedValueOnce(null)
    await expect(groupService.findBySlug(db, id)).resolves.toBeNull()
  })
})
