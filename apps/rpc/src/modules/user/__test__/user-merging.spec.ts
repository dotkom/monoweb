import { randomUUID } from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
import type { Membership, User } from "@dotkomonline/types"
import { beforeEach, describe, expect, it, type vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import type { GroupRepository } from "../../group/group-repository"
import { mergeUsers } from "../user-merging"

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    username: randomUUID(),
    name: null,
    email: null,
    imageUrl: null,
    biography: null,
    phone: null,
    gender: null,
    dietaryRestrictions: null,
    ntnuUsername: null,
    flags: [],
    workspaceUserId: null,
    privacyPermissionsId: null,
    notificationPermissionsId: null,
    memberships: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function makeMembership(userId: string, overrides: Partial<Membership> = {}): Membership {
  return {
    id: randomUUID(),
    type: "BACHELOR_STUDENT",
    specialization: null,
    semester: 1,
    start: new Date("2024-01-01"),
    end: new Date("2024-06-01"),
    userId,
    ...overrides,
  }
}

describe("mergeUsers", () => {
  let handle: ReturnType<typeof mockDeep<DBHandle>>
  let groupRepository: ReturnType<typeof mockDeep<GroupRepository>>

  beforeEach(() => {
    handle = mockDeep<DBHandle>()
    groupRepository = mockDeep<GroupRepository>()
    groupRepository.findManyGroupMemberships.mockResolvedValue([])
    groupRepository.deleteGroupMemberships.mockResolvedValue(undefined)
    groupRepository.createManyGroupMemberships.mockResolvedValue(undefined)
  })

  describe("scalar backfill", () => {
    it("backfills null scalar fields from consumed user", async () => {
      const survivor = makeUser({ biography: null })
      const consumed = makeUser({ biography: "consuming bio" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ biography: "consuming bio" }) })
      )
    })

    it("keeps survivor's value when it is not null", async () => {
      const survivor = makeUser({ biography: "my bio" })
      const consumed = makeUser({ biography: "their bio" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      const [[updateArgs]] = (handle.user.update as ReturnType<typeof vi.fn>).mock.calls
      expect(updateArgs.data).not.toHaveProperty("biography")
    })
  })

  describe("username custom merger", () => {
    it("adopts consumed's custom slug when survivor has a UUID slug", async () => {
      const survivor = makeUser({ username: randomUUID() })
      const consumed = makeUser({ username: "my-custom-slug" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "my-custom-slug" }) })
      )
    })

    it("keeps survivor's custom slug when it is not a UUID", async () => {
      const survivor = makeUser({ username: "survivor-slug" })
      const consumed = makeUser({ username: "other-slug" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "survivor-slug" }) })
      )
    })

    it("keeps survivor's UUID slug when consumed also has a UUID slug", async () => {
      const survivorSlug = randomUUID()
      const survivor = makeUser({ username: survivorSlug })
      const consumed = makeUser({ username: randomUUID() })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: survivorSlug }) })
      )
    })
  })

  describe("flags custom merger", () => {
    it("concatenates and deduplicates flags from both users", async () => {
      const survivor = makeUser({ flags: ["a", "b"] })
      const consumed = makeUser({ flags: ["b", "c"] })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      const [[updateArgs]] = (handle.user.update as ReturnType<typeof vi.fn>).mock.calls
      expect(new Set(updateArgs.data.flags)).toEqual(new Set(["a", "b", "c"]))
    })
  })

  describe("one-to-one relation backfill", () => {
    it("backfills privacyPermissionsId from consumed when survivor's is null", async () => {
      const survivor = makeUser({ privacyPermissionsId: null })
      const consumed = makeUser({ privacyPermissionsId: "perm-123" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ privacyPermissionsId: "perm-123" }) })
      )
    })

    it("deletes consumed's orphaned privacyPermissions when both users have one", async () => {
      const survivor = makeUser({ privacyPermissionsId: "survivor-perm" })
      const consumed = makeUser({ privacyPermissionsId: "consumed-perm" })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.privacyPermissions.delete).toHaveBeenCalledWith({ where: { id: "consumed-perm" } })
    })

    it("does not delete privacyPermissions when consumed has none", async () => {
      const survivor = makeUser({ privacyPermissionsId: "survivor-perm" })
      const consumed = makeUser({ privacyPermissionsId: null })

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.privacyPermissions.delete).not.toHaveBeenCalled()
    })
  })

  describe("membership deduplication", () => {
    it("transfers non-duplicate memberships from consumed to survivor", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      survivor.memberships = [makeMembership(survivor.id, { type: "BACHELOR_STUDENT", semester: 1 })]
      const consumedMembership = makeMembership(consumed.id, { type: "MASTER_STUDENT", semester: 1 })
      consumed.memberships = [consumedMembership]

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.membership.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [consumedMembership.id] } },
        data: { userId: survivor.id },
      })
      expect(handle.membership.deleteMany).toHaveBeenCalledWith({ where: { userId: consumed.id } })
    })

    it("drops duplicate memberships without transferring them", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      survivor.memberships = [
        makeMembership(survivor.id, { type: "BACHELOR_STUDENT", specialization: null, semester: 1 }),
      ]
      consumed.memberships = [
        makeMembership(consumed.id, { type: "BACHELOR_STUDENT", specialization: null, semester: 1 }),
      ]

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.membership.updateMany).not.toHaveBeenCalled()
      expect(handle.membership.deleteMany).toHaveBeenCalledWith({ where: { userId: consumed.id } })
    })
  })

  describe("relation reassignment", () => {
    it("reassigns attendee records from consumed to survivor", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.attendee.updateMany).toHaveBeenCalledWith({
        where: { userId: consumed.id },
        data: { userId: survivor.id },
      })
    })

    it("reassigns auditLog records from consumed to survivor", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.auditLog.updateMany).toHaveBeenCalledWith({
        where: { userId: consumed.id },
        data: { userId: survivor.id },
      })
    })
  })

  describe("consumed user deletion", () => {
    it("deletes the consumed user after the merge", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      await mergeUsers(handle, groupRepository, survivor, consumed)

      expect(handle.user.delete).toHaveBeenCalledWith({ where: { id: consumed.id } })
    })
  })
})
