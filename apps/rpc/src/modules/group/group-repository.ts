import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type GroupMembership,
  type GroupMembershipId,
  GroupMembershipSchema,
  type GroupMembershipWrite,
  type GroupRole,
  type GroupRoleId,
  GroupRoleSchema,
  type GroupRoleWrite,
  GroupSchema,
  type GroupWrite,
  type MembershipId,
  type UserId,
} from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"
import z from "zod"
import { parseOrReport } from "../../invariant"

export interface GroupRepository {
  create(handle: DBHandle, groupId: GroupId, data: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupId: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupId: GroupId): Promise<Group>
  getById(handle: DBHandle, groupId: GroupId): Promise<Group | null>
  getMany(handle: DBHandle, groupIds: GroupId[]): Promise<Group[]>
  getAll(handle: DBHandle): Promise<Group[]>
  getAllByType(handle: DBHandle, type: GroupType): Promise<Group[]>
  getMembershipById(handle: DBHandle, id: MembershipId): Promise<GroupMembership | null>
  getMemberships(handle: DBHandle, groupId: GroupId, userId?: UserId): Promise<GroupMembership[]>
  getGroupsByUserId(handle: DBHandle, userId: UserId): Promise<Group[]>
  createMembership(handle: DBHandle, data: GroupMembershipWrite, roleIds: Set<GroupRoleId>): Promise<GroupMembership>
  updateMembership(
    handle: DBHandle,
    id: GroupMembershipId,
    data: GroupMembershipWrite,
    roleIds: Set<GroupRoleId>
  ): Promise<GroupMembership>
  deleteMembership(handle: DBHandle, id: GroupMembershipId): Promise<void>
  createRoles(handle: DBHandle, roles: GroupRoleWrite[]): Promise<GroupRole[]>
  updateRole(handle: DBHandle, id: GroupRoleId, role: Partial<GroupRoleWrite>): Promise<GroupRole>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, groupId, data) {
      const group = await handle.group.create({
        data: { ...data, slug: groupId },
        include: QUERY_WITH_ROLES,
      })
      return parseOrReport(GroupSchema, group)
    },
    async update(handle, groupId, data) {
      const group = await handle.group.update({
        where: { slug: groupId },
        data,
        include: QUERY_WITH_ROLES,
      })
      return parseOrReport(GroupSchema, group)
    },
    async delete(handle, groupId) {
      const group = await handle.group.delete({
        where: { slug: groupId },
        include: QUERY_WITH_ROLES,
      })
      return parseOrReport(GroupSchema, group)
    },
    async getById(handle, groupId) {
      const group = await handle.group.findUnique({
        where: { slug: groupId },
        include: QUERY_WITH_ROLES,
      })
      return group ? parseOrReport(GroupSchema, group) : null
    },
    async getMany(handle, groupIds) {
      const groups = await handle.group.findMany({
        where: {
          slug: { in: groupIds },
        },
        include: QUERY_WITH_ROLES,
      })

      return parseOrReport(z.array(GroupSchema), groups)
    },
    async getAll(handle) {
      const groups = await handle.group.findMany({
        include: QUERY_WITH_ROLES,
      })
      return groups.map((group) => parseOrReport(GroupSchema, group))
    },
    async getAllByType(handle, groupType) {
      const groups = await handle.group.findMany({
        where: { type: groupType },
        include: QUERY_WITH_ROLES,
      })
      return groups.map((group) => parseOrReport(GroupSchema, group))
    },
    async getMembershipById(handle, id) {
      const membership = await handle.groupMembership.findUnique({
        where: { id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return membership
        ? parseOrReport(GroupMembershipSchema, {
            ...membership,
            roles: membership?.roles.map((role) => role.role),
          })
        : null
    },
    async getMemberships(handle, groupId, userId) {
      const memberships = await handle.groupMembership.findMany({
        where: { groupId, ...(userId ? { userId } : {}) },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return memberships.map(({ roles, ...membership }) =>
        parseOrReport(GroupMembershipSchema, {
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
          roles: true,
        },
      })
      return groups.map((group) => parseOrReport(GroupSchema, group))
    },
    async createMembership(handle, data, roleIds) {
      const membership = await handle.groupMembership.create({
        data: {
          ...data,
          roles: {
            createMany: {
              data: Array.from(roleIds).map((roleId) => ({ roleId })),
            },
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return parseOrReport(GroupMembershipSchema, {
        ...membership,
        roles: membership.roles.map((role) => role.role),
      })
    },
    async updateMembership(handle, id, data, roleIds) {
      const membership = await handle.groupMembership.update({
        where: {
          id: id,
        },
        data: {
          ...data,
          roles: {
            deleteMany: {
              membershipId: id,
              roleId: {
                notIn: Array.from(roleIds),
              },
            },
            connectOrCreate: Array.from(roleIds)?.map((roleId) => ({
              create: { roleId },
              where: { membershipId_roleId: { membershipId: id, roleId: roleId } },
            })),
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      return parseOrReport(GroupMembershipSchema, {
        ...membership,
        roles: membership.roles.map((role) => role.role),
      })
    },
    async deleteMembership(handle, id) {
      await handle.groupMembership.delete({
        where: {
          id,
        },
      })
    },
    async createRoles(handle, roles) {
      const rows = await handle.groupRole.createManyAndReturn({
        data: roles,
      })

      return parseOrReport(z.array(GroupRoleSchema), rows)
    },
    async updateRole(handle, id, role) {
      const row = await handle.groupRole.update({
        where: {
          id,
        },
        data: role,
      })

      return parseOrReport(GroupRoleSchema, row)
    },
  }
}

const QUERY_WITH_ROLES = {
  roles: true,
} as const
