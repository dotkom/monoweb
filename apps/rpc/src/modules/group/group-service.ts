import type { DBHandle } from "@dotkomonline/db"
import type { Group, GroupId, GroupMember, GroupMemberWrite, GroupType, GroupWrite, UserId } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
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
  delete(handle: DBHandle, groupId: GroupId): Promise<void>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, groupType: GroupType): Promise<GroupId[]>
  getMembers(handle: DBHandle, groupId: GroupId): Promise<GroupMember[]>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  addMember(handle: DBHandle, data: GroupMemberWrite): Promise<GroupMember>
  removeMember(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<void>
}

export function getGroupService(groupRepository: GroupRepository): GroupService {
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
      let id = slugify(payload.name)
      // We try to find an available slug. This should hopefully never run more than once, but maybe some future idiot
      // is trying to break the authorization system by creating a group with a name that is already taken.
      for (let i = 1; ; i++) {
        const match = await groupRepository.getById(handle, id)
        if (match === null) {
          break
        }
        // If the id already exists, we try something like slug-1
        id = `${slugify(payload.name)}-${i}`
      }
      return groupRepository.create(handle, id, payload)
    },
    async update(handle, groupId, values) {
      return groupRepository.update(handle, groupId, values)
    },
    async delete(handle, groupId) {
      await groupRepository.delete(handle, groupId)
    },
    async getAllIds(handle) {
      return groupRepository.getAllIds(handle)
    },
    async getAllIdsByType(handle, groupType) {
      return groupRepository.getAllIdsByType(handle, groupType)
    },
    async getMembers(handle, groupId) {
      return groupRepository.getMembers(handle, groupId)
    },
    async getAllByMember(handle, userId) {
      return groupRepository.getAllByMember(handle, userId)
    },
    async addMember(handle, data) {
      return groupRepository.addMember(handle, data)
    },
    async removeMember(handle, userId, groupId) {
      await groupRepository.removeMember(handle, userId, groupId)
    },
  }
}
