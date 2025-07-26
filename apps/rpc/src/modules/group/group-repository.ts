import type { DBHandle } from "@dotkomonline/db"
import type {
  Group,
  GroupId,
  GroupMembership,
  GroupMembershipId,
  GroupMembershipWrite,
  GroupRole,
  GroupWrite,
  UserId,
} from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"

export interface GroupRepository {
  create(handle: DBHandle, groupId: GroupId, data: GroupWrite, groupMemberRoles: GroupRole[]): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getById(handle: DBHandle, groupId: GroupId): Promise<Group | null>
  getAll(handle: DBHandle): Promise<Group[]>
  getAllByType(handle: DBHandle, type: GroupType): Promise<Group[]>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, type: GroupType): Promise<GroupId[]>
  getMemberships(handle: DBHandle, groupId: GroupId): Promise<Omit<GroupMembership, "user">[]>
  getGroupsByUserId(handle: DBHandle, userId: UserId): Promise<Group[]>
  startMembership(handle: DBHandle, data: GroupMembershipWrite): Promise<Omit<GroupMembership, "user">>
  endMembership(handle: DBHandle, membership: GroupMembershipId): Promise<Omit<GroupMembership, "user">>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, groupId, data, groupMemberRoles) {
      // Group needs a role to have as its leader role, so we must create roles first
      await handle.groupRole.createMany({
        data: groupMemberRoles,
      })

      return await handle.group.create({
        data: { ...data, slug: groupId },
      })
    },
    async update(handle, groupId, data) {
      return await handle.group.update({
        where: { slug: groupId },
        data,
      })
    },
    async delete(handle, groupId) {
      return await handle.group.delete({
        where: { slug: groupId },
      })
    },
    async getById(handle, groupId) {
      return await handle.group.findUnique({
        where: { slug: groupId },
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
          select: { slug: true },
        })
      ).map((group) => group.slug)
    },
    async getAllIdsByType(handle, groupType) {
      return (
        await handle.group.findMany({
          where: { type: groupType },
          select: { slug: true },
        })
      ).map((group) => group.slug)
    },
    async getMemberships(handle, groupId) {
      const memberships = await handle.groupMembership.findMany({
        where: { groupId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return memberships.map(({ roles, ...membership }) => ({
        ...membership,
        roles: roles.map((role) => role.role),
      }))
    },
    async getGroupsByUserId(handle, userId) {
      return await handle.group.findMany({
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
        include: {
          memberships: true,
        },
      })
    },
    async startMembership(handle, data) {
      const membership = await handle.groupMembership.create({
        data,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return { ...membership, roles: membership.roles.map((role) => role.role) }
    },
    async endMembership(handle, membershipId) {
      const membership = await handle.groupMembership.delete({
        where: {
          id: membershipId,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return { ...membership, roles: membership.roles.map((role) => role.role) }
    },
  }
}
