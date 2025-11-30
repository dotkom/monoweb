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
  type UserId,
} from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"
import z from "zod"
import { parseOrReport } from "../../invariant"

export interface GroupRepository {
  create(handle: DBHandle, groupSlug: GroupId, data: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupSlug: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupSlug: GroupId): Promise<Group>
  findBySlug(handle: DBHandle, groupSlug: GroupId): Promise<Group | null>
  findByGroupRoleId(handle: DBHandle, groupRoleId: GroupRoleId): Promise<Group | null>
  findByGroupMembershipId(handle: DBHandle, groupMembershipId: GroupMembershipId): Promise<Group | null>
  findMany(handle: DBHandle): Promise<Group[]>
  findManyBySlugs(handle: DBHandle, groupSlugs: GroupId[]): Promise<Group[]>
  findManyByType(handle: DBHandle, groupType: GroupType): Promise<Group[]>
  findManyByUserId(handle: DBHandle, userId: UserId): Promise<Group[]>

  createGroupMembership(
    handle: DBHandle,
    groupMembershipData: GroupMembershipWrite,
    groupRoleIds: Set<GroupRoleId>
  ): Promise<GroupMembership>
  updateGroupMembership(
    handle: DBHandle,
    groupMembershipId: GroupMembershipId,
    groupMembershipData: GroupMembershipWrite,
    groupRoleIds: Set<GroupRoleId>
  ): Promise<GroupMembership>
  findGroupMembershipById(handle: DBHandle, groupMembershipId: GroupMembershipId): Promise<GroupMembership | null>
  findManyGroupMemberships(handle: DBHandle, groupSlug: GroupId, userId?: UserId): Promise<GroupMembership[]>

  createGroupRoles(handle: DBHandle, groupRolesData: GroupRoleWrite[]): Promise<GroupRole[]>
  updateGroupRole(
    handle: DBHandle,
    groupRoleId: GroupRoleId,
    groupRoleData: Partial<GroupRoleWrite>
  ): Promise<GroupRole>
}

export function getGroupRepository(): GroupRepository {
  return {
    async create(handle, groupSlug, data) {
      const group = await handle.group.create({
        data: { ...data, slug: groupSlug },
        include: QUERY_WITH_ROLES,
      })

      return parseOrReport(GroupSchema, group)
    },

    async update(handle, groupSlug, data) {
      const group = await handle.group.update({
        where: { slug: groupSlug },
        data,
        include: QUERY_WITH_ROLES,
      })

      return parseOrReport(GroupSchema, group)
    },

    async delete(handle, groupSlug) {
      const group = await handle.group.delete({
        where: { slug: groupSlug },
        include: QUERY_WITH_ROLES,
      })

      return parseOrReport(GroupSchema, group)
    },

    async findBySlug(handle, groupSlug) {
      const group = await handle.group.findUnique({
        where: { slug: groupSlug },
        include: QUERY_WITH_ROLES,
      })

      return group ? parseOrReport(GroupSchema, group) : null
    },

    async findByGroupRoleId(handle, groupRoleId) {
      const role = await handle.groupRole.findUnique({
        where: {
          id: groupRoleId,
        },
        include: {
          group: {
            include: QUERY_WITH_ROLES,
          },
        },
      })

      return role ? parseOrReport(GroupSchema.nullable(), role.group) : null
    },

    async findByGroupMembershipId(handle, groupMembershipId) {
      const membership = await handle.groupMembership.findUnique({
        where: {
          id: groupMembershipId,
        },
        include: {
          group: {
            include: QUERY_WITH_ROLES,
          },
        },
      })

      return membership ? parseOrReport(GroupSchema.nullable(), membership.group) : null
    },

    async findMany(handle) {
      const groups = await handle.group.findMany({
        include: QUERY_WITH_ROLES,
      })

      return groups.map((group) => parseOrReport(GroupSchema, group))
    },

    async findManyBySlugs(handle, groupSlugs) {
      const groups = await handle.group.findMany({
        where: {
          slug: { in: groupSlugs },
        },
        include: QUERY_WITH_ROLES,
      })

      return parseOrReport(z.array(GroupSchema), groups)
    },

    async findManyByType(handle, groupType) {
      const groups = await handle.group.findMany({
        where: { type: groupType },
        include: QUERY_WITH_ROLES,
      })

      return groups.map((group) => parseOrReport(GroupSchema, group))
    },

    async findManyByUserId(handle, userId) {
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

      return parseOrReport(GroupSchema.array(), groups)
    },

    async createGroupMembership(handle, groupMembershipData, groupRoleIds) {
      const membership = await handle.groupMembership.create({
        data: {
          ...groupMembershipData,
          roles: {
            createMany: {
              data: Array.from(groupRoleIds).map((roleId) => ({ roleId })),
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

    async updateGroupMembership(handle, groupMembershipId, groupMembershipData, groupRoleIds) {
      const membership = await handle.groupMembership.update({
        where: {
          id: groupMembershipId,
        },
        data: {
          ...groupMembershipData,
          roles: {
            deleteMany: {
              membershipId: groupMembershipId,
              roleId: {
                notIn: Array.from(groupRoleIds),
              },
            },
            connectOrCreate: Array.from(groupRoleIds)?.map((roleId) => ({
              create: { roleId },
              where: {
                membershipId_roleId: { membershipId: groupMembershipId, roleId: roleId },
              },
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

    async findGroupMembershipById(handle, groupMembershipId) {
      const membership = await handle.groupMembership.findUnique({
        where: { id: groupMembershipId },
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

    async findManyGroupMemberships(handle, groupSlug, userId) {
      const memberships = await handle.groupMembership.findMany({
        where: { groupId: groupSlug, ...(userId ? { userId } : {}) },
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

    async createGroupRoles(handle, groupRoles) {
      const rows = await handle.groupRole.createManyAndReturn({
        data: groupRoles,
      })

      return parseOrReport(GroupRoleSchema.array(), rows)
    },

    async updateGroupRole(handle, groupRoleId, groupRole) {
      const row = await handle.groupRole.update({
        where: {
          id: groupRoleId,
        },
        data: groupRole,
      })

      return parseOrReport(GroupRoleSchema, row)
    },
  }
}

const QUERY_WITH_ROLES = {
  roles: true,
} as const
