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
  type MembershipId,
  type UserId,
  getDefaultGroupMemberRoles,
} from "@dotkomonline/types"
import { getCurrentUTC, slugify } from "@dotkomonline/utils"
import { areIntervalsOverlapping, compareDesc } from "date-fns"
import { maxTime } from "date-fns/constants"
import invariant from "tiny-invariant"
import { FailedPreconditionError, NotFoundError } from "../../error"
import type { UserService } from "../user/user-service"
import type { GroupRepository } from "./group-repository"

export interface GroupService {
  /**
   * Get a group by its id
   *
   * @throws {NotFoundError} if the group does not exist
   */
  getById(handle: DBHandle, groupId: GroupId): Promise<Group>
  getMany(handle: DBHandle, groupIds: GroupId[]): Promise<Group[]>
  getByIdAndType(handle: DBHandle, groupId: GroupId, groupType: GroupType): Promise<Group>
  getAll(handle: DBHandle): Promise<Group[]>
  /**
   * Get a group by its id and type
   *
   * @throws {NotFoundError} if the group does not exist
   */
  getAllByType(handle: DBHandle, groupType: GroupType): Promise<Group[]>
  create(handle: DBHandle, payload: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, values: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getMembers(handle: DBHandle, groupId: GroupId): Promise<Map<UserId, GroupMember>>
  getMember(handle: DBHandle, groupId: GroupId, userId: UserId): Promise<GroupMember>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  startMembership(handle: DBHandle, userId: UserId, groupId: GroupId, roleIds: Set<GroupRoleId>): Promise<GroupMember>
  endMembership(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<GroupMembership[]>
  deleteMembership(handle: DBHandle, id: GroupMembershipId): Promise<void>
  /**
   * Attempts to update a membership if it doesn't overlap with existing memberships
   *
   * @throws {NotFoundError} if the membership overlaps others
   */
  updateMembership(
    handle: DBHandle,
    id: MembershipId,
    data: GroupMembershipWrite,
    roleIds: Set<GroupRoleId>
  ): Promise<GroupMembership>
  createRole(handle: DBHandle, data: GroupRoleWrite): Promise<GroupRole>
  updateRole(handle: DBHandle, id: GroupRoleId, role: GroupRoleWrite): Promise<GroupRole>
}

export function getGroupService(groupRepository: GroupRepository, userService: UserService): GroupService {
  return {
    async getById(handle, groupId) {
      const group = await groupRepository.getById(handle, groupId)
      if (!group) throw new NotFoundError(`Group(ID=${groupId}) not found`)
      return group
    },
    async getByIdAndType(handle, groupId, groupType) {
      const group = await groupRepository.getById(handle, groupId)
      if (!group || group.type !== groupType) {
        throw new NotFoundError(`Group(ID=${groupId}, Type=${groupType}) not found`)
      }
      return group
    },
    async getAll(handle) {
      return groupRepository.getAll(handle)
    },
    async getAllByType(handle, groupType) {
      return groupRepository.getAllByType(handle, groupType)
    },
    async getMany(handle, groupSlugs) {
      const groups = await groupRepository.getMany(handle, groupSlugs)

      if (groups.length < groupSlugs.length) {
        const missingGroupSlugs = groupSlugs.filter(
          (groupSlug) => groups.find((group) => group.slug === groupSlug) === null
        )
        throw new NotFoundError(`Group(Slug in [${missingGroupSlugs.join(", ")}]) not found`)
      }

      return groups
    },
    async create(handle, payload) {
      let id = slugify(payload.abbreviation)
      const inputSlug = payload.slug?.trim()
      if (inputSlug && inputSlug.length > 1) {
        id = slugify(inputSlug)
      }

      // We try to find an available slug. This should hopefully never run more than once, but maybe some future idiot
      // is trying to break the authorization system by creating a group with a name that is already taken.
      for (let i = 1; ; i++) {
        const match = await groupRepository.getById(handle, id)
        if (match === null) {
          break
        }
        // If the id already exists, we try something like slug-1
        id = `${slugify(payload.abbreviation)}-${i}`
      }

      await groupRepository.create(handle, id, payload)
      await groupRepository.createRoles(handle, getDefaultGroupMemberRoles(id))

      return await this.getById(handle, id)
    },
    async update(handle, groupId, values) {
      const inputSlug = values.slug?.trim()
      const slug = inputSlug && inputSlug.length > 1 ? slugify(inputSlug) : undefined

      return groupRepository.update(handle, groupId, { ...values, slug })
    },
    async delete(handle, groupId) {
      return await groupRepository.delete(handle, groupId)
    },
    async getMembers(handle, groupId) {
      const memberships = await groupRepository.getMemberships(handle, groupId)

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
          throw new Error(`Member not found for user ${user.id} in group ${groupId}`)
        }

        members.set(user.id, {
          ...user,
          groupMemberships,
        })
      }

      return members
    },
    async getMember(handle, groupId, userId) {
      const memberships = await groupRepository.getMemberships(handle, groupId, userId)

      if (memberships.length === 0) {
        throw new Error(`Member not found for user ${userId} in group ${groupId}`)
      }

      const user = await userService.getById(handle, userId)
      const groupMemberships = memberships.sort((a, b) => compareDesc(a.start, b.start))

      return {
        ...user,
        groupMemberships,
      }
    },
    async getAllByMember(handle, userId) {
      return groupRepository.getGroupsByUserId(handle, userId)
    },
    async startMembership(handle, userId, groupId, roleIds) {
      await this.endMembership(handle, userId, groupId)

      const data: GroupMembershipWrite = {
        userId,
        groupId,
        start: getCurrentUTC(),
        end: null,
      }

      await groupRepository.createMembership(handle, data, roleIds)
      return await this.getMember(handle, groupId, userId)
    },
    async endMembership(handle, userId, groupId) {
      const memberships = await groupRepository.getMemberships(handle, groupId, userId)
      const activeMemberships = memberships.filter((membership) => !membership.end)

      const endMembershipPromises = activeMemberships.map((membership) =>
        groupRepository.updateMembership(
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

    async deleteMembership(handle, id) {
      const membership = await groupRepository.getMembershipById(handle, id)
      if (!membership) {
        throw new NotFoundError(`GroupMembership(ID=${id}) not found`)
      }

      if (!membership.end) {
        throw new FailedPreconditionError(`Cannot delete active GroupMembership(ID=${id})`)
      }

      return await groupRepository.deleteMembership(handle, id)
    },

    async updateMembership(handle, id, data, roleIds) {
      const currentMembership = await groupRepository.getMembershipById(handle, id)
      if (!currentMembership) {
        throw new NotFoundError(`GroupMembership(ID=${id}) not found`)
      }

      const memberships = await groupRepository.getMemberships(
        handle,
        currentMembership.groupId,
        currentMembership.userId
      )

      for (const membership of memberships) {
        if (membership.id === id) continue

        const maxDate = new Date(maxTime)

        if (
          areIntervalsOverlapping(
            { start: membership.start, end: membership.end ?? maxDate },
            { start: data.start, end: data.end ?? maxDate },
            { inclusive: false }
          )
        ) {
          throw new FailedPreconditionError(`GroupMembership(ID=${id}) overlaps with existing memberships`)
        }
      }

      return await groupRepository.updateMembership(handle, id, data, roleIds)
    },
    async createRole(handle, data) {
      const result = await groupRepository.createRoles(handle, [data])
      const role = result.at(0)
      invariant(role !== undefined, "Role should exist after creation")

      return role
    },
    async updateRole(handle, id, role) {
      return await groupRepository.updateRole(handle, id, role)
    },
  }
}
