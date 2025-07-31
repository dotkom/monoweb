import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type GroupMember,
  type GroupMembershipWrite,
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
  getMany(handle: DBHandle, groupIds: GroupId[]): Promise<Group[]>
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
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  addMember(handle: DBHandle, data: GroupMembershipWrite): Promise<GroupMember>
  removeMember(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<Omit<GroupMember, "user">>
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
    async getMany(handle, groupSlugs) {
      const groups = await groupRepository.getMany(handle, groupSlugs)

      if (groups.length < groupSlugs.length) {
        const missingGroupSlugs = groupSlugs.filter(
          (groupSlug) => groups.find((group) => group.slug === groupSlug) === null
        )
        throw new GroupNotFoundError(`Failed to retrieve many groups, missing: ${missingGroupSlugs.join(", ")}`)
      }

      return groups
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

      return groupRepository.create(handle, id, payload, getDefaultGroupMemberRoles(id))
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
    async getAllByMember(handle, userId) {
      return groupRepository.getGroupsByUserId(handle, userId)
    },
    async addMember(handle, data) {
      // TODO: const member = await groupRepository.addMember(handle, data)
      // const user = await userService.getById(handle, data.userId)
      //
      // return { ...member, user }
      throw new Error("Not implemented yet")
    },
    async removeMember(handle, userId, groupId) {
      // TODO: return await groupRepository.removeMember(handle, userId, groupId)
      throw new Error("Not implemented yet")
    },
  }
}
