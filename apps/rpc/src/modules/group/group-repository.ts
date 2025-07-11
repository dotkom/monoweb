import type { DBHandle } from "@dotkomonline/db"
import type { Group, GroupId, GroupMember, GroupMemberWrite, GroupWrite, UserId } from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"

export interface GroupRepository {
  create(handle: DBHandle, values: GroupWrite): Promise<Group>
  update(handle: DBHandle, id: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, id: GroupId): Promise<void>
  getById(handle: DBHandle, id: GroupId): Promise<Group | null>
  getAll(handle: DBHandle): Promise<Group[]>
  getAllByType(handle: DBHandle, type: GroupType): Promise<Group[]>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, type: GroupType): Promise<GroupId[]>
  getMembers(handle: DBHandle, id: GroupId): Promise<GroupMember[]>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  addMember(handle: DBHandle, data: GroupMemberWrite): Promise<GroupMember>
  removeMember(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<void>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, data) {
      return await handle.group.create({ data })
    },
    async update(handle, groupId, data) {
      return await handle.group.update({ where: { id: groupId }, data })
    },
    async delete(handle, groupId) {
      await handle.group.delete({ where: { id: groupId } })
    },
    async getById(handle, groupId) {
      return await handle.group.findUnique({ where: { id: groupId } })
    },
    async getAll(handle) {
      return await handle.group.findMany()
    },
    async getAllByType(handle, groupType) {
      return await handle.group.findMany({ where: { type: groupType } })
    },
    async getAllIds(handle) {
      return (await handle.group.findMany({ select: { id: true } })).map((group) => group.id)
    },
    async getAllIdsByType(handle, groupType) {
      return (await handle.group.findMany({ where: { type: groupType }, select: { id: true } })).map(
        (group) => group.id
      )
    },
    async getMembers(handle, groupId) {
      return await handle.groupMember.findMany({ where: { groupId } })
    },
    async getAllByMember(handle, userId) {
      return await handle.group.findMany({ where: { members: { some: { userId } } } })
    },
    async addMember(handle, data) {
      return await handle.groupMember.create({ data })
    },
    async removeMember(handle, userId, groupId) {
      await handle.groupMember.delete({ where: { userId, groupId } })
    },
  }
}
