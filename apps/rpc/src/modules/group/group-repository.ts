import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type GroupMembership,
  type GroupMembershipId,
  GroupMembershipSchema,
  type GroupMembershipWrite,
  type GroupRole,
  GroupSchema,
  type GroupWrite,
  type UserId,
} from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"
import { parseOrReport } from "../../invariant"

export interface GroupRepository {
  create(handle: DBHandle, groupId: GroupId, data: GroupWrite, groupMemberRoles: GroupRole[]): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getById(handle: DBHandle, groupId: GroupId): Promise<Group | null>
  getAll(handle: DBHandle): Promise<Group[]>
  getAllByType(handle: DBHandle, type: GroupType): Promise<Group[]>
  getAllIds(handle: DBHandle): Promise<GroupId[]>
  getAllIdsByType(handle: DBHandle, type: GroupType): Promise<GroupId[]>
  getMemberships(handle: DBHandle, groupId: GroupId): Promise<GroupMembership[]>
  getGroupsByUserId(handle: DBHandle, userId: UserId): Promise<Group[]>
  startMembership(handle: DBHandle, data: GroupMembershipWrite): Promise<GroupMembership>
  endMembership(handle: DBHandle, membership: GroupMembershipId): Promise<GroupMembership>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, groupId, data, groupMemberRoles) {
      // Group needs a role to have as its leader role, so we must create roles first
      await handle.groupRole.createMany({
        data: groupMemberRoles,
      })

      const group = await handle.group.create({
        data: { ...data, slug: groupId },
      })
      return parseOrReport(GroupSchema, group)
    },
    async update(handle, groupId, data) {
      const group = await handle.group.update({
        where: { slug: groupId },
        data,
      })
      return parseOrReport(GroupSchema, group)
    },
    async delete(handle, groupId) {
      const group = await handle.group.delete({
        where: { slug: groupId },
      })
      return parseOrReport(GroupSchema, group)
    },
    async getById(handle, groupId) {
      const group = await handle.group.findUnique({
        where: { slug: groupId },
      })
      return group ? parseOrReport(GroupSchema, group) : null
    },
    async getAll(handle) {
      const groups = await handle.group.findMany()
      return groups.map((group) => parseOrReport(GroupSchema, group))
    },
    async getAllByType(handle, groupType) {
      const groups = await handle.group.findMany({
        where: { type: groupType },
      })
      return groups.map((group) => parseOrReport(GroupSchema, group))
    },
    async getAllIds(handle) {
      const groups = await handle.group.findMany({
        select: { slug: true },
      })
      return groups.map((group) => group.slug)
    },
    async getAllIdsByType(handle, groupType) {
      const groups = await handle.group.findMany({
        where: { type: groupType },
        select: { slug: true },
      })
      return groups.map((group) => group.slug)
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

      return memberships.map(({ roles, ...membership }) =>
        parseOrReport(GroupMembershipSchema.omit({ user: true }), {
          ...membership,
          roles: roles.map((role) => role.role),
        })
      )
    },
    async getGroupsByUserId(handle, userId) {
      const groups = await handle.group.findMany({
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
      return groups.map((group) => parseOrReport(GroupSchema, group))
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

      return parseOrReport(GroupMembershipSchema.omit({ user: true }), {
        ...membership,
        roles: membership.roles.map((role) => role.role),
      })
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

      return parseOrReport(GroupMembershipSchema.omit({ user: true }), {
        ...membership,
        roles: membership.roles.map((role) => role.role),
      })
    },
  }
}
