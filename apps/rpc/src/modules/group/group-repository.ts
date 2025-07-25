import type { DBHandle } from "@dotkomonline/db"
import type {
  Group,
  GroupId,
  GroupMember,
  GroupMemberRole,
  GroupMemberWrite,
  GroupWrite,
  UserId,
} from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"

export interface GroupRepository {
  create(handle: DBHandle, groupId: GroupId, data: GroupWrite, groupMemberRoles: GroupMemberRole[]): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getById(handle: DBHandle, groupId: GroupId): Promise<Group | null>
  getAll(handle: DBHandle): Promise<Group[]>
  getAllByType(handle: DBHandle, type: GroupType): Promise<Group[]>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, type: GroupType): Promise<GroupId[]>
  getMembers(handle: DBHandle, groupId: GroupId): Promise<Omit<GroupMember, "user">[]>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<Group[]>
  addMember(handle: DBHandle, data: GroupMemberWrite): Promise<Omit<GroupMember, "user">>
  removeMember(handle: DBHandle, userId: UserId, groupId: GroupId): Promise<Omit<GroupMember, "user">>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, groupId, data, groupMemberRoles) {
      // Group needs a role to have as its leader role, so we must create roles first
      await handle.groupMemberRole.createMany({
        data: groupMemberRoles,
      })

      return await handle.group.create({
        data: { ...data, id: groupId },
      })
    },
    async update(handle, groupId, data) {
      return await handle.group.update({
        where: { id: groupId },
        data,
      })
    },
    async delete(handle, groupId) {
      return await handle.group.delete({
        where: { id: groupId },
      })
    },
    async getById(handle, groupId) {
      return await handle.group.findUnique({
        where: { id: groupId },
      })
    },
    async getAll(handle) {
      return await handle.group.findMany()
    },
    async getAllByType(handle, groupType) {
      return await handle.group.findMany({
        where: { type: groupType },
      })
    },
    async getAllIds(handle) {
      return (
        await handle.group.findMany({
          select: { id: true },
        })
      ).map((group) => group.id)
    },
    async getAllIdsByType(handle, groupType) {
      return (
        await handle.group.findMany({
          where: { type: groupType },
          select: { id: true },
        })
      ).map((group) => group.id)
    },
    async getMembers(handle, groupId) {
      return await handle.groupMember.findMany({
        where: { groupId },
        include: {
          periods: {
            orderBy: { startedAt: "desc" },
            include: {
              roles: true,
            },
          },
        },
      })
    },
    async getAllByMember(handle, userId) {
      return await handle.group.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      })
    },
    async addMember(handle, data) {
      const { periods, ...rest } = data

      const member = await handle.groupMember.create({
        data: rest,
        include: {
          periods: {
            include: {
              roles: true,
            },
          },
        },
      })

      await handle.groupMemberPeriod.createMany({ data: periods })

      return member
    },
    async removeMember(handle, userId, groupId) {
      return await handle.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        include: {
          periods: {
            include: {
              roles: true,
            },
          },
        },
      })
    },
  }
}
