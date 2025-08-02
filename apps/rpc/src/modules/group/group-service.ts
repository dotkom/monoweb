import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type GroupMember,
  type GroupMembership,
  type GroupMembershipWrite,
  type GroupRole,
  type GroupRoleId,
  type GroupRoleWrite,
  type GroupType,
  type GroupWrite,
  type UserId,
  getDefaultGroupMemberRoles,
} from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import { compareDesc } from "date-fns"
import type { UserService } from "../user/user-service"
import { GroupNotFoundError } from "./group-error"
import type { GroupRepository } from "./group-repository"

export interface GroupService {
  /**
   * Get a group by its id
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  getById(handle: DBHandle, groupId: GroupId): Promise<Group>
  getByIdAndType(handle: DBHandle, groupId: GroupId, groupType: GroupType): Promise<Group>
  getAll(handle: DBHandle): Promise<Group[]>
  /**
   * Get a group by its id and type
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  getAllByType(handle: DBHandle, groupType: GroupType): Promise<Group[]>
  create(handle: DBHandle, payload: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, values: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, groupType: GroupType): Promise<GroupId[]>
  getMembers(handle: DBHandle, groupId: GroupId): Promise<Map<UserId, GroupMember>>
  getMember(handle: DBHandle, groupId: GroupId, userId: UserId): Promise<GroupMember>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  startMembership(handle: DBHandle, data: GroupMembershipWrite, roleIds: Set<GroupRoleId>): Promise<GroupMember>
  endMembership(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<GroupMembership[]>
  createRole(handle: DBHandle, data: GroupRoleWrite): Promise<void>
  updateRole(handle: DBHandle, id: GroupRoleId, role: GroupRoleWrite): Promise<GroupRole>
}

export function getGroupService(groupRepository: GroupRepository, userService: UserService): GroupService {
  return {
    async getById(handle, groupId) {
      const group = await groupRepository.getById(handle, groupId)
      if (!group) throw new GroupNotFoundError(groupId)
      return group
    },
    async getByIdAndType(handle, groupId, groupType) {
      const group = await groupRepository.getById(handle, groupId)
      if (!group || group.type !== groupType) throw new GroupNotFoundError(groupId)
      return group
    },
    async getAll(handle) {
      return groupRepository.getAll(handle)
    },
    async getAllByType(handle, groupType) {
      return groupRepository.getAllByType(handle, groupType)
    },
    async create(handle, payload) {
      let id = slugify(payload.abbreviation)

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
      return groupRepository.update(handle, groupId, values)
    },
    async delete(handle, groupId) {
      return await groupRepository.delete(handle, groupId)
    },
    async getAllIds(handle) {
      return groupRepository.getAllIds(handle)
    },
    async getAllIdsByType(handle, groupType) {
      return groupRepository.getAllIdsByType(handle, groupType)
    },
    async getMembers(handle, groupId) {
      const memberships = await groupRepository.getMemberships(handle, groupId)

      if (!memberships) {
        return new Map()
      }

      const members = new Map<UserId, GroupMember>()

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
    async startMembership(handle, data, roleIds) {
      await this.endMembership(handle, data.userId, data.groupId)
      await groupRepository.startMembership(handle, data, roleIds)

      return await this.getMember(handle, data.groupId, data.userId)
    },
    async endMembership(handle, userId, groupId) {
      const memberships = await groupRepository.getMemberships(handle, groupId, userId)
      const activeMemberships = memberships.filter((membership) => !membership.end)

      const endMembershipPromises = activeMemberships.map((membership) =>
        groupRepository.endMembership(handle, membership.id)
      )
      return await Promise.all(endMembershipPromises)
    },
    async createRole(handle, data) {
      await groupRepository.createRoles(handle, [data])
    },
    async updateRole(handle, id, role) {
      return await groupRepository.updateRole(handle, id, role)
    },
  }
}
