import type { S3Client } from "@aws-sdk/client-s3"
import { PrismaClient } from "@dotkomonline/db"
import {
  type Group,
  type GroupRole,
  DEFAULT_GROUP_ROLE_TEMPLATE,
  getDefaultGroupMemberRoles,
  getGroupDisplayName,
  getGroupSecondaryName,
  GroupRoleTypeEnum,
} from "../group"
import type { ManagementClient } from "auth0"
import { randomUUID } from "node:crypto"
import { getFeideGroupsRepository } from "../../feide/feide-groups-repository"
import { getMembershipService } from "../../user/membership-service"
import { getUserRepository } from "../../user/user-repository"
import { getUserService } from "../../user/user-service"
import type { EmailService } from "../../email/email-service"
import { mockDeep } from "vitest-mock-extended"
import { CommitteeGroupSlug } from "../../authorization-service"
import { getGroupRepository } from "../group-repository"
import { getGroupService } from "../group-service"
import { FailedPreconditionError } from "../../../error"
import { beforeEach, describe, expect, it, vi } from "vitest"

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
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
    ...overrides,
  }
}

function makeRole(overrides: Partial<GroupRole> = {}): GroupRole {
  return {
    id: randomUUID(),
    name: "Medlem",
    type: GroupRoleTypeEnum.COSMETIC,
    isDefault: false,
    groupId: CommitteeGroupSlug.DOTKOM,
    ...overrides,
  }
}

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
    "fake-aws-bucket",
    mockDeep<EmailService>(),
    "http://localhost:3000"
  )

  const groupService = getGroupService(groupRepository, userService, s3Client, "fake-aws-bucket")

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("creates a new group with default roles including a default member role", async () => {
    const group = makeGroup()
    vi.spyOn(groupRepository, "findBySlug").mockResolvedValueOnce(null).mockResolvedValueOnce(group)
    vi.spyOn(groupRepository, "create").mockResolvedValueOnce(group)
    vi.spyOn(groupRepository, "createGroupRoles").mockResolvedValueOnce([])

    const created = await groupService.create(db, group)
    expect(created).toEqual(group)
    expect(groupRepository.create).toHaveBeenCalledWith(db, CommitteeGroupSlug.DOTKOM, group)

    const expectedRoles = getDefaultGroupMemberRoles(CommitteeGroupSlug.DOTKOM)
    expect(groupRepository.createGroupRoles).toHaveBeenCalledWith(db, expectedRoles)
    expect(expectedRoles.some((role) => role.isDefault === true && role.name === "Medlem")).toBe(true)
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

  describe("default group role", () => {
    it("clears the previous default when creating a new default role", async () => {
      const currentDefault = makeRole({ id: "current-default", isDefault: true })
      const createdRole = makeRole({ id: "new-default", name: "Ny standard", isDefault: true })
      const group = makeGroup({ roles: [currentDefault] })

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      vi.spyOn(groupRepository, "updateGroupRole").mockResolvedValue({ ...currentDefault, isDefault: false })
      vi.spyOn(groupRepository, "createGroupRoles").mockResolvedValue([createdRole])

      const result = await groupService.createRole(db, {
        groupId: group.slug,
        name: createdRole.name,
        type: GroupRoleTypeEnum.COSMETIC,
        isDefault: true,
      })

      expect(groupRepository.updateGroupRole).toHaveBeenCalledWith(db, currentDefault.id, { isDefault: false })
      expect(result).toEqual(createdRole)
    })

    it("does not clear the previous default when creating a non-default role", async () => {
      const currentDefault = makeRole({ id: "current-default", isDefault: true })
      const createdRole = makeRole({ id: "other-role", name: "Annen", isDefault: false })
      const group = makeGroup({ roles: [currentDefault] })

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      const updateSpy = vi.spyOn(groupRepository, "updateGroupRole")
      vi.spyOn(groupRepository, "createGroupRoles").mockResolvedValue([createdRole])

      await groupService.createRole(db, {
        groupId: group.slug,
        name: createdRole.name,
        type: GroupRoleTypeEnum.COSMETIC,
        isDefault: false,
      })

      expect(updateSpy).not.toHaveBeenCalled()
    })

    it("refuses to unset the current default role", async () => {
      const defaultRole = makeRole({ id: "default-role", isDefault: true })
      const group = makeGroup({ roles: [defaultRole] })

      vi.spyOn(groupRepository, "findByGroupRoleId").mockResolvedValue(group)

      await expect(
        groupService.updateRole(db, defaultRole.id, {
          groupId: group.slug,
          name: defaultRole.name,
          type: defaultRole.type,
          isDefault: false,
        })
      ).rejects.toBeInstanceOf(FailedPreconditionError)
    })

    it("clears the previous default when promoting another role", async () => {
      const currentDefault = makeRole({ id: "current-default", isDefault: true })
      const nextDefault = makeRole({ id: "next-default", name: "Nestleder", type: GroupRoleTypeEnum.DEPUTY_LEADER })
      const group = makeGroup({ roles: [currentDefault, nextDefault] })
      const updatedNextDefault = { ...nextDefault, isDefault: true }

      vi.spyOn(groupRepository, "findByGroupRoleId").mockResolvedValue(group)
      vi.spyOn(groupRepository, "updateGroupRole")
        .mockResolvedValueOnce({ ...currentDefault, isDefault: false })
        .mockResolvedValueOnce(updatedNextDefault)

      const result = await groupService.updateRole(db, nextDefault.id, {
        groupId: group.slug,
        name: nextDefault.name,
        type: nextDefault.type,
        isDefault: true,
      })

      expect(groupRepository.updateGroupRole).toHaveBeenNthCalledWith(1, db, currentDefault.id, { isDefault: false })
      expect(groupRepository.updateGroupRole).toHaveBeenNthCalledWith(2, db, nextDefault.id, {
        groupId: group.slug,
        name: nextDefault.name,
        type: nextDefault.type,
        isDefault: true,
      })
      expect(result).toEqual(updatedNextDefault)
    })

    it("refuses to delete the default role", async () => {
      const defaultRole = makeRole({ id: "default-role", isDefault: true })
      const group = makeGroup({ roles: [defaultRole] })

      vi.spyOn(groupRepository, "findByGroupRoleId").mockResolvedValue(group)
      const deleteSpy = vi.spyOn(groupRepository, "deleteGroupRole")

      await expect(groupService.deleteRole(db, defaultRole.id)).rejects.toBeInstanceOf(FailedPreconditionError)
      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it("deletes a non-default role", async () => {
      const defaultRole = makeRole({ id: "default-role", isDefault: true })
      const otherRole = makeRole({ id: "other-role", name: "Leder", type: GroupRoleTypeEnum.LEADER })
      const group = makeGroup({ roles: [defaultRole, otherRole] })

      vi.spyOn(groupRepository, "findByGroupRoleId").mockResolvedValue(group)
      vi.spyOn(groupRepository, "deleteGroupRole").mockResolvedValue()

      await groupService.deleteRole(db, otherRole.id)

      expect(groupRepository.deleteGroupRole).toHaveBeenCalledWith(db, otherRole.id)
    })

    it("returns the existing default role from getOrCreateDefaultGroupRole", async () => {
      const defaultRole = makeRole({ id: "default-role", isDefault: true })
      const group = makeGroup({ roles: [defaultRole] })

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      const updateSpy = vi.spyOn(groupRepository, "updateGroupRole")
      const createSpy = vi.spyOn(groupRepository, "createGroupRoles")

      await expect(groupService.getOrCreateDefaultGroupRole(db, group.slug)).resolves.toEqual(defaultRole)
      expect(updateSpy).not.toHaveBeenCalled()
      expect(createSpy).not.toHaveBeenCalled()
    })

    it("promotes an exact Medlem COSMETIC match when no default exists", async () => {
      const medlem = makeRole({
        id: "medlem",
        name: DEFAULT_GROUP_ROLE_TEMPLATE.name,
        type: DEFAULT_GROUP_ROLE_TEMPLATE.type,
      })
      const otherCosmetic = makeRole({ id: "other", name: "Annen", type: GroupRoleTypeEnum.COSMETIC })
      const group = makeGroup({ roles: [otherCosmetic, medlem] })
      const promoted = { ...medlem, isDefault: true }

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      vi.spyOn(groupRepository, "updateGroupRole").mockResolvedValue(promoted)

      await expect(groupService.getOrCreateDefaultGroupRole(db, group.slug)).resolves.toEqual(promoted)
      expect(groupRepository.updateGroupRole).toHaveBeenCalledWith(db, medlem.id, { isDefault: true })
    })

    it("promotes any COSMETIC role when Medlem is missing", async () => {
      const cosmetic = makeRole({ id: "cosmetic", name: "Vanlig medlem", type: GroupRoleTypeEnum.COSMETIC })
      const group = makeGroup({ roles: [cosmetic] })
      const promoted = { ...cosmetic, isDefault: true }

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      vi.spyOn(groupRepository, "updateGroupRole").mockResolvedValue(promoted)

      await expect(groupService.getOrCreateDefaultGroupRole(db, group.slug)).resolves.toEqual(promoted)
      expect(groupRepository.updateGroupRole).toHaveBeenCalledWith(db, cosmetic.id, { isDefault: true })
    })

    it("creates a Medlem COSMETIC default when no suitable role exists", async () => {
      const leader = makeRole({ id: "leader", name: "Leder", type: GroupRoleTypeEnum.LEADER })
      const group = makeGroup({ roles: [leader] })
      const created = makeRole({
        id: "created-default",
        name: DEFAULT_GROUP_ROLE_TEMPLATE.name,
        type: DEFAULT_GROUP_ROLE_TEMPLATE.type,
        isDefault: true,
      })

      vi.spyOn(groupRepository, "findBySlug").mockResolvedValue(group)
      vi.spyOn(groupRepository, "createGroupRoles").mockResolvedValue([created])

      await expect(groupService.getOrCreateDefaultGroupRole(db, group.slug)).resolves.toEqual(created)
      expect(groupRepository.createGroupRoles).toHaveBeenCalledWith(db, [
        {
          ...DEFAULT_GROUP_ROLE_TEMPLATE,
          groupId: group.slug,
          isDefault: true,
        },
      ])
    })

    it("uses the default role when starting a membership without role ids", async () => {
      const defaultRole = makeRole({ id: "default-role", isDefault: true })
      const userId = randomUUID()
      const member = { id: userId, groupMemberships: [] }

      vi.spyOn(groupService, "endMembership").mockResolvedValue([])
      vi.spyOn(groupService, "getOrCreateDefaultGroupRole").mockResolvedValue(defaultRole)
      vi.spyOn(groupService, "getMember").mockResolvedValue(member as never)
      vi.spyOn(groupRepository, "createGroupMembership").mockResolvedValue({
        id: randomUUID(),
        userId,
        groupId: CommitteeGroupSlug.DOTKOM,
        start: new Date(),
        end: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [defaultRole],
      })

      await groupService.startMembership(db, userId, CommitteeGroupSlug.DOTKOM)

      expect(groupService.getOrCreateDefaultGroupRole).toHaveBeenCalledWith(db, CommitteeGroupSlug.DOTKOM)
      expect(groupRepository.createGroupMembership).toHaveBeenCalledWith(
        db,
        expect.objectContaining({ userId, groupId: CommitteeGroupSlug.DOTKOM }),
        new Set([defaultRole.id])
      )
    })

    it("keeps explicit role ids when starting a membership", async () => {
      const roleId = "explicit-role"
      const userId = randomUUID()
      const member = { id: userId, groupMemberships: [] }

      vi.spyOn(groupService, "endMembership").mockResolvedValue([])
      const getOrCreateSpy = vi.spyOn(groupService, "getOrCreateDefaultGroupRole")
      vi.spyOn(groupService, "getMember").mockResolvedValue(member as never)
      vi.spyOn(groupRepository, "createGroupMembership").mockResolvedValue({
        id: randomUUID(),
        userId,
        groupId: CommitteeGroupSlug.DOTKOM,
        start: new Date(),
        end: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      })

      await groupService.startMembership(db, userId, CommitteeGroupSlug.DOTKOM, new Set([roleId]))

      expect(getOrCreateSpy).not.toHaveBeenCalled()
      expect(groupRepository.createGroupMembership).toHaveBeenCalledWith(
        db,
        expect.objectContaining({ userId, groupId: CommitteeGroupSlug.DOTKOM }),
        new Set([roleId])
      )
    })
  })
})
