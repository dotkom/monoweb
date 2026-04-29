import { randomUUID } from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
import { GenderSchema, type Membership, type User } from "@dotkomonline/types"
import { beforeEach, describe, expect, it, type vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import type { AttendanceService } from "../../event/attendance-service"
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
    gender: GenderSchema.enum.UNKNOWN,
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
  let attendanceService: ReturnType<typeof mockDeep<AttendanceService>>
  let deps: { groupRepository: GroupRepository; attendanceService: AttendanceService }

  beforeEach(() => {
    handle = mockDeep<DBHandle>()
    groupRepository = mockDeep<GroupRepository>()
    groupRepository.findManyGroupMemberships.mockResolvedValue([])
    groupRepository.deleteGroupMemberships.mockResolvedValue(undefined)
    attendanceService = mockDeep<AttendanceService>()
    attendanceService.deregisterAttendee.mockResolvedValue(undefined)
    handle.attendee.findMany.mockResolvedValue([])
    handle.personalMark.findMany.mockResolvedValue([])
    deps = { groupRepository, attendanceService }
  })

  describe("scalar backfill", () => {
    it("backfills null scalar fields from consumed user", async () => {
      const survivor = makeUser({ biography: null })
      const consumed = makeUser({ biography: "consuming bio" })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ biography: "consuming bio" }) })
      )
    })

    it("keeps survivor's value when it is not null", async () => {
      const survivor = makeUser({ biography: "my bio" })
      const consumed = makeUser({ biography: "their bio" })

      await mergeUsers(handle, deps, survivor, consumed)

      const [[updateArgs]] = (handle.user.update as ReturnType<typeof vi.fn>).mock.calls
      expect(updateArgs.data).not.toHaveProperty("biography")
    })
  })

  describe("username custom merger", () => {
    it("adopts consumed's custom slug when survivor has a UUID slug", async () => {
      const survivor = makeUser({ username: randomUUID() })
      const consumed = makeUser({ username: "my-custom-slug" })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "my-custom-slug" }) })
      )
    })

    it("keeps survivor's custom slug when it is not a UUID", async () => {
      const survivor = makeUser({ username: "survivor-slug" })
      const consumed = makeUser({ username: "other-slug" })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: "survivor-slug" }) })
      )
    })

    it("keeps survivor's UUID slug when consumed also has a UUID slug", async () => {
      const survivorSlug = randomUUID()
      const survivor = makeUser({ username: survivorSlug })
      const consumed = makeUser({ username: randomUUID() })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ username: survivorSlug }) })
      )
    })
  })

  describe("flags custom merger", () => {
    it("concatenates and deduplicates flags from both users", async () => {
      const survivor = makeUser({ flags: ["a", "b"] })
      const consumed = makeUser({ flags: ["b", "c"] })

      await mergeUsers(handle, deps, survivor, consumed)

      const [[updateArgs]] = (handle.user.update as ReturnType<typeof vi.fn>).mock.calls
      expect(new Set(updateArgs.data.flags)).toEqual(new Set(["a", "b", "c"]))
    })
  })

  describe("one-to-one relation backfill", () => {
    it("backfills privacyPermissionsId from consumed when survivor's is null", async () => {
      const survivor = makeUser({ privacyPermissionsId: null })
      const consumed = makeUser({ privacyPermissionsId: "perm-123" })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ privacyPermissionsId: "perm-123" }) })
      )
    })

    it("deletes consumed's orphaned privacyPermissions when both users have one", async () => {
      const survivor = makeUser({ privacyPermissionsId: "survivor-perm" })
      const consumed = makeUser({ privacyPermissionsId: "consumed-perm" })

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.privacyPermissions.delete).toHaveBeenCalledWith({ where: { id: "consumed-perm" } })
    })

    it("does not delete privacyPermissions when consumed has none", async () => {
      const survivor = makeUser({ privacyPermissionsId: "survivor-perm" })
      const consumed = makeUser({ privacyPermissionsId: null })

      await mergeUsers(handle, deps, survivor, consumed)

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

      await mergeUsers(handle, deps, survivor, consumed)

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

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.membership.updateMany).not.toHaveBeenCalled()
      expect(handle.membership.deleteMany).toHaveBeenCalledWith({ where: { userId: consumed.id } })
    })
  })

  describe("relation reassignment", () => {
    it("reassigns auditLog records from consumed to survivor", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.auditLog.updateMany).toHaveBeenCalledWith({
        where: { userId: consumed.id },
        data: { userId: survivor.id },
      })
    })
  })

  describe("attendee deduplication", () => {
    it("reassigns non-conflicting consumed attendees to the survivor", async () => {
      const survivor = makeUser()
      const consumed = makeUser()
      const consumedAttendeeId = randomUUID()

      handle.attendee.findMany.mockImplementation(
        async ({ where }) =>
          (where?.userId === survivor.id
            ? []
            : [{ id: consumedAttendeeId, attendanceId: "attendance-only-on-consumed" }]) as never
      )

      await mergeUsers(handle, deps, survivor, consumed)

      expect(attendanceService.deregisterAttendee).not.toHaveBeenCalled()
      expect(handle.attendee.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [consumedAttendeeId] } },
        data: { userId: survivor.id },
      })
    })

    it("deregisters the consumed user's attendee when both users are registered to the same attendance", async () => {
      const survivor = makeUser()
      const consumed = makeUser()
      const sharedAttendanceId = "attendance-shared"
      const consumedAttendeeId = randomUUID()

      handle.attendee.findMany.mockImplementation(
        async ({ where }) =>
          (where?.userId === survivor.id
            ? [{ attendanceId: sharedAttendanceId }]
            : [{ id: consumedAttendeeId, attendanceId: sharedAttendanceId }]) as never
      )

      await mergeUsers(handle, deps, survivor, consumed)

      expect(attendanceService.deregisterAttendee).toHaveBeenCalledWith(handle, consumedAttendeeId, {
        ignoreDeregistrationWindow: true,
      })
      expect(handle.attendee.updateMany).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { userId: survivor.id } })
      )
    })

    it("deregisters conflicts and reassigns the rest in a single merge", async () => {
      const survivor = makeUser()
      const consumed = makeUser()
      const sharedAttendanceId = "attendance-shared"
      const conflictingAttendeeId = randomUUID()
      const standaloneAttendeeId = randomUUID()

      handle.attendee.findMany.mockImplementation(
        async ({ where }) =>
          (where?.userId === survivor.id
            ? [{ attendanceId: sharedAttendanceId }]
            : [
                { id: conflictingAttendeeId, attendanceId: sharedAttendanceId },
                { id: standaloneAttendeeId, attendanceId: "attendance-only-on-consumed" },
              ]) as never
      )

      await mergeUsers(handle, deps, survivor, consumed)

      expect(attendanceService.deregisterAttendee).toHaveBeenCalledWith(handle, conflictingAttendeeId, {
        ignoreDeregistrationWindow: true,
      })
      expect(handle.attendee.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [standaloneAttendeeId] } },
        data: { userId: survivor.id },
      })
    })
  })

  describe("personal mark deduplication", () => {
    it("reassigns consumed personal marks when survivor has none of the same mark ids", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      handle.personalMark.findMany.mockResolvedValue([])

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.personalMark.deleteMany).not.toHaveBeenCalled()
      expect(handle.personalMark.updateMany).toHaveBeenCalledWith({
        where: { userId: consumed.id },
        data: { userId: survivor.id },
      })
    })

    it("deletes the consumed user's personal mark rows that the survivor also has", async () => {
      const survivor = makeUser()
      const consumed = makeUser()
      const sharedMarkId = "mark-shared"

      handle.personalMark.findMany.mockResolvedValue([{ markId: sharedMarkId }] as never)

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.personalMark.deleteMany).toHaveBeenCalledWith({
        where: { userId: consumed.id, markId: { in: [sharedMarkId] } },
      })
      expect(handle.personalMark.updateMany).toHaveBeenCalledWith({
        where: { userId: consumed.id },
        data: { userId: survivor.id },
      })
    })
  })

  describe("consumed user deletion", () => {
    it("deletes the consumed user after the merge", async () => {
      const survivor = makeUser()
      const consumed = makeUser()

      await mergeUsers(handle, deps, survivor, consumed)

      expect(handle.user.delete).toHaveBeenCalledWith({ where: { id: consumed.id } })
    })
  })
})
