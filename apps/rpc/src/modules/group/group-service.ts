import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type GroupMember,
  type GroupMembership,
  type GroupMembershipId,
  type GroupMembershipWrite,
  type GroupRole,
  type GroupRoleId,
  type GroupRoleWrite,
  type GroupType,
  type GroupWrite,
  type UserId,
  getDefaultGroupMemberRoles,
} from "@dotkomonline/types"
import { createS3PresignedPost, getCurrentUTC, slugify } from "@dotkomonline/utils"
import { areIntervalsOverlapping, compareDesc } from "date-fns"
import { maxTime } from "date-fns/constants"
import invariant from "tiny-invariant"
import { FailedPreconditionError, NotFoundError } from "../../error"
import type { UserService } from "../user/user-service"
import type { GroupRepository } from "./group-repository"

export interface GroupService {
  create(handle: DBHandle, data: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupSlug: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupSlug: GroupId): Promise<Group>
  findBySlug(handle: DBHandle, groupSlug: GroupId): Promise<Group | null>
  /**
   * Get a group by its id
   *
   * @throws {NotFoundError} if the group does not exist
   */
  getBySlug(handle: DBHandle, groupSlug: GroupId): Promise<Group>
  getByGroupRoleId(handle: DBHandle, groupRoleId: GroupRoleId): Promise<Group>
  getByGroupMembershipId(handle: DBHandle, groupMembershipId: GroupMembershipId): Promise<Group>
  /**
   * Get a group by its slug and type
   *
   * @throws {NotFoundError} if the group does not exist
   */
  getBySlugAndType(handle: DBHandle, groupSlug: GroupId, groupType: GroupType): Promise<Group>
  findMany(handle: DBHandle): Promise<Group[]>
  findManyByType(handle: DBHandle, groupType: GroupType): Promise<Group[]>
  findManyByGroupSlugs(handle: DBHandle, groupSlugs: GroupId[]): Promise<Group[]>
  findManyByMemberUserId(handle: DBHandle, userId: UserId): Promise<Group[]>

  getMember(handle: DBHandle, groupSlug: GroupId, userId: UserId): Promise<GroupMember>
  getMembers(handle: DBHandle, groupSlug: GroupId): Promise<Map<UserId, GroupMember>>

  startMembership(
    handle: DBHandle,
    userId: UserId,
    groupSlug: GroupId,
    groupRoleIds: Set<GroupRoleId>
  ): Promise<GroupMember>
  endMembership(handle: DBHandle, userId: UserId, groupSlug: GroupId): Promise<GroupMembership[]>
  /**
   * Attempts to update a membership if it doesn't overlap with existing memberships
   *
   * @throws {NotFoundError} if the group membership does not exist
   * @throws {FailedPreconditionError} if the membership overlaps others
   */
  updateMembership(
    handle: DBHandle,
    groupMembershipId: GroupMembershipId,
    groupMembershipData: GroupMembershipWrite,
    groupRoleIds: Set<GroupRoleId>
  ): Promise<GroupMembership>

  createRole(handle: DBHandle, groupRoleData: GroupRoleWrite): Promise<GroupRole>
  updateRole(handle: DBHandle, groupRoleId: GroupRoleId, groupRoleData: GroupRoleWrite): Promise<GroupRole>

  createFileUpload(
    handle: DBHandle,
    filename: string,
    contentType: string,
    createdByUserId: UserId
  ): Promise<PresignedPost>
}

export function getGroupService(
  groupRepository: GroupRepository,
  userService: UserService,
  s3Client: S3Client,
  s3BucketName: string
): GroupService {
  return {
    async create(handle, data) {
      let slug = slugify(data.abbreviation)
      const inputSlug = data.slug?.trim()
      if (inputSlug && inputSlug.length > 1) {
        slug = slugify(inputSlug)
      }

      // We try to find an available slug. This should hopefully never run more than once, but maybe some future idiot
      // is trying to break the authorization system by creating a group with a name that is already taken.
      for (let i = 1; ; i++) {
        const match = await groupRepository.findBySlug(handle, slug)
        if (match === null) {
          break
        }
        // If the id already exists, we try something like slug-1
        slug = `${slugify(data.abbreviation)}-${i}`
      }

      await groupRepository.create(handle, slug, data)
      await groupRepository.createGroupRoles(handle, getDefaultGroupMemberRoles(slug))

      return await this.getBySlug(handle, slug)
    },

    async update(handle, groupSlug, data) {
      const inputSlug = data.slug?.trim()
      const slug = inputSlug && inputSlug.length > 1 ? slugify(inputSlug) : undefined

      return groupRepository.update(handle, groupSlug, { ...data, slug })
    },

    async delete(handle, groupSlug) {
      return await groupRepository.delete(handle, groupSlug)
    },

    async findBySlug(handle, groupSlug) {
      return groupRepository.findBySlug(handle, groupSlug)
    },

    async getBySlug(handle, groupSlug) {
      const group = await this.findBySlug(handle, groupSlug)
      if (!group) throw new NotFoundError(`Group(ID=${groupSlug}) not found`)
      return group
    },

    async getByGroupRoleId(handle, groupRoleId) {
      const group = await groupRepository.findByGroupRoleId(handle, groupRoleId)
      if (!group) {
        throw new NotFoundError(`Group with GroupRole(ID=${groupRoleId}) not found`)
      }
      return group
    },

    async getByGroupMembershipId(handle, groupMembershipId) {
      const group = await groupRepository.findByGroupMembershipId(handle, groupMembershipId)
      if (!group) {
        throw new NotFoundError(`Group with GroupMembership(ID=${groupMembershipId}) not found`)
      }
      return group
    },

    async getBySlugAndType(handle, groupSlug, groupType) {
      const group = await groupRepository.findBySlug(handle, groupSlug)
      if (!group || group.type !== groupType) {
        throw new NotFoundError(`Group(ID=${groupSlug}, Type=${groupType}) not found`)
      }
      return group
    },

    async findMany(handle) {
      return groupRepository.findMany(handle)
    },

    async findManyByType(handle, groupType) {
      return groupRepository.findManyByType(handle, groupType)
    },

    async findManyByGroupSlugs(handle, groupSlugs) {
      const groups = await groupRepository.findManyBySlugs(handle, groupSlugs)

      if (groups.length < groupSlugs.length) {
        const missingGroupSlugs = groupSlugs.filter(
          (groupSlug) => groups.find((group) => group.slug === groupSlug) === null
        )
        throw new NotFoundError(`Group(Slug in [${missingGroupSlugs.join(", ")}]) not found`)
      }

      return groups
    },

    async findManyByMemberUserId(handle, userId) {
      return groupRepository.findManyByUserId(handle, userId)
    },

    async getMember(handle, groupSlug, userId) {
      const memberships = await groupRepository.findManyGroupMemberships(handle, groupSlug, userId)

      if (memberships.length === 0) {
        throw new Error(`Member not found for user ${userId} in group ${groupSlug}`)
      }

      const user = await userService.getById(handle, userId)
      const groupMemberships = memberships.sort((a, b) => compareDesc(a.start, b.start))

      return {
        ...user,
        groupMemberships,
      }
    },

    async getMembers(handle, groupSlug) {
      const memberships = await groupRepository.findManyGroupMemberships(handle, groupSlug)

      if (!memberships) {
        return new Map()
      }

      const members = new Map<UserId, GroupMember>()

      // TODO: N+1 Query
      const usersPromises = memberships.map((member) => userService.getById(handle, member.userId))
      const users = await Promise.all(usersPromises)

      for (const user of users) {
        const groupMemberships = memberships
          .filter((membership) => membership.userId === user.id)
          .sort((a, b) => compareDesc(a.start, b.start))

        if (groupMemberships.length === 0) {
          throw new Error(`Member not found for user ${user.id} in group ${groupSlug}`)
        }

        members.set(user.id, {
          ...user,
          groupMemberships,
        })
      }

      return members
    },

    async startMembership(handle, userId, groupSlug, groupRoleIds) {
      await this.endMembership(handle, userId, groupSlug)

      const data: GroupMembershipWrite = {
        userId,
        groupId: groupSlug,
        start: getCurrentUTC(),
        end: null,
      }

      await groupRepository.createGroupMembership(handle, data, groupRoleIds)
      return await this.getMember(handle, groupSlug, userId)
    },

    async endMembership(handle, userId, groupSlug) {
      const memberships = await groupRepository.findManyGroupMemberships(handle, groupSlug, userId)
      const activeMemberships = memberships.filter((membership) => !membership.end)

      const endMembershipPromises = activeMemberships.map((membership) =>
        groupRepository.updateGroupMembership(
          handle,
          membership.id,
          {
            ...membership,
            end: getCurrentUTC(),
          },
          new Set(membership.roles.map((role) => role.id))
        )
      )

      return await Promise.all(endMembershipPromises)
    },

    async updateMembership(handle, groupMembershipId, groupMembershipData, groupRoleIds) {
      const currentMembership = await groupRepository.findGroupMembershipById(handle, groupMembershipId)
      if (!currentMembership) {
        throw new NotFoundError(`GroupMembership(ID=${groupMembershipId}) not found`)
      }

      const memberships = await groupRepository.findManyGroupMemberships(
        handle,
        currentMembership.groupId,
        currentMembership.userId
      )

      for (const membership of memberships) {
        if (membership.id === groupMembershipId) continue

        const maxDate = new Date(maxTime)

        if (
          areIntervalsOverlapping(
            { start: membership.start, end: membership.end ?? maxDate },
            { start: groupMembershipData.start, end: groupMembershipData.end ?? maxDate },
            { inclusive: false }
          )
        ) {
          throw new FailedPreconditionError(
            `GroupMembership(ID=${groupMembershipId}) overlaps with existing memberships`
          )
        }
      }

      return await groupRepository.updateGroupMembership(handle, groupMembershipId, groupMembershipData, groupRoleIds)
    },

    async createRole(handle, groupRoleData) {
      const result = await groupRepository.createGroupRoles(handle, [groupRoleData])
      const role = result.at(0)
      invariant(role !== undefined, "Role should exist after creation")

      return role
    },

    async updateRole(handle, groupRoleId, groupRoleData) {
      return await groupRepository.updateGroupRole(handle, groupRoleId, groupRoleData)
    },

    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `group/${Date.now()}-${uuid}-${slugify(filename)}`

      const maxSizeKiB = 5 * 1024 // 5 MiB, arbitrarily set

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB,
        contentType,
        createdByUserId,
      })
    },
  }
}
