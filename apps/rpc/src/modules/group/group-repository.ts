import type { DBHandle, GroupType, Prisma } from "@dotkomonline/db"
import { getCurrentUTC } from "@dotkomonline/utils"
import { differenceInMilliseconds } from "date-fns"
import {
  type Group,
  type GroupByMemberFilter,
  type GroupId,
  type GroupMember,
  GroupMemberSchema,
  type GroupMembership,
  type GroupMembershipId,
  GroupMembershipSchema,
  type GroupMembershipWrite,
  type GroupRole,
  type GroupRoleId,
  GroupRoleSchema,
  type GroupRoleType,
  type GroupRoleWrite,
  GroupSchema,
  type GroupWrite,
} from "./group"
import { type UserId, normalizeDbUser } from "../user/user"
import z from "zod"
import { parseOrReport } from "../../invariant"

const GROUP_TYPE_SORT_ORDER = {
  COMMITTEE: 0,
  NODE_COMMITTEE: 1,
  ASSOCIATED: 2,
  INTEREST_GROUP: 3,
  EMAIL_ONLY: 4,
} as const satisfies Record<GroupType, number>

export interface GroupRepository {
  create(handle: DBHandle, groupSlug: GroupId, data: GroupWrite): Promise<Group>
  update(handle: DBHandle, groupSlug: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(handle: DBHandle, groupSlug: GroupId): Promise<Group>
  findBySlug(handle: DBHandle, groupSlug: GroupId): Promise<Group | null>
  findByGroupRoleId(handle: DBHandle, groupRoleId: GroupRoleId): Promise<Group | null>
  findByGroupMembershipId(handle: DBHandle, groupMembershipId: GroupMembershipId): Promise<Group | null>
  findMany(handle: DBHandle, filter?: { includeEmailGroups?: boolean }): Promise<Group[]>
  findManyBySlugs(handle: DBHandle, groupSlugs: GroupId[]): Promise<Group[]>
  findManyByType(handle: DBHandle, groupType: GroupType): Promise<Group[]>
  findManyByUserId(handle: DBHandle, userId: UserId, filter?: GroupByMemberFilter): Promise<Group[]>

  findGroupMembershipById(handle: DBHandle, groupMembershipId: GroupMembershipId): Promise<GroupMembership | null>
  findGroupMembersByRoleType(handle: DBHandle, groupSlug: GroupId, roleType: GroupRoleType): Promise<GroupMember[]>

  findManyGroupMemberships(
    handle: DBHandle,
    groupSlug: GroupId | null,
    userId: UserId | null
  ): Promise<GroupMembership[]>
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
  deleteGroupMemberships(handle: DBHandle, groupMembershipIds: GroupMembershipId[]): Promise<void>

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

    async findMany(handle, filter) {
      const groups = await handle.group.findMany({
        where: {
          ...(filter?.includeEmailGroups ? {} : { NOT: { type: "EMAIL_ONLY" } }),
        },
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
        include: {
          ...QUERY_WITH_ROLES,
          _count: { select: { events: true } },
        },
      })

      return groups.map((group) =>
        parseOrReport(GroupSchema, {
          ...group,
          eventCount: group._count.events,
        })
      )
    },

    async findManyByUserId(handle, userId, filter) {
      const includeEmailGroups = filter?.includeEmailGroups ?? false
      const includeEmailOnlyMemberships = filter?.includeEmailOnlyMemberships ?? false
      const membershipFilter = getMembershipFilterForUser(userId, includeEmailOnlyMemberships)

      const groups = await handle.group.findMany({
        where: {
          ...getGroupTypeFilter(includeEmailGroups),
          memberships: {
            some: membershipFilter,
          },
        },
        include: {
          memberships: {
            where: membershipFilter,
          },
          roles: true,
        },
      })

      const now = getCurrentUTC()

      const sortedGroups = groups.toSorted((leftGroup, rightGroup) =>
        compareGroupsByMembership(leftGroup, rightGroup, now)
      )

      return parseOrReport(GroupSchema.array(), sortedGroups)
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

    async findGroupMembersByRoleType(handle, groupSlug, roleType) {
      const users = await handle.user.findMany({
        where: {
          groupMemberships: {
            some: {
              groupId: groupSlug,
              roles: {
                some: {
                  role: {
                    type: roleType,
                  },
                },
              },
            },
          },
        },
        include: {
          memberships: true,
          userFlagLinks: {
            include: {
              userFlag: true,
            },
          },
          groupMemberships: {
            where: {
              groupId: groupSlug,
              roles: {
                some: {
                  role: {
                    type: roleType,
                  },
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
          },
        },
      })

      const groupMembers = users.map(({ groupMemberships, ...user }) => ({
        ...normalizeDbUser(user),
        groupMemberships: groupMemberships.map(({ roles, ...membership }) => ({
          ...membership,
          roles: roles.map((role) => role.role),
        })),
      }))

      return parseOrReport(GroupMemberSchema.array(), groupMembers)
    },

    async findManyGroupMemberships(handle, groupSlug, userId) {
      const memberships = await handle.groupMembership.findMany({
        where: {
          ...(groupSlug ? { groupId: groupSlug } : {}),
          ...(userId ? { userId } : {}),
        },
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

    async deleteGroupMemberships(handle, groupMembershipIds) {
      await handle.groupMembership.deleteMany({
        where: {
          id: {
            in: groupMembershipIds,
          },
        },
      })
    },
  }
}

const QUERY_WITH_ROLES = {
  roles: true,
} as const

function getGroupTypeFilter(includeEmailGroups: boolean) {
  if (includeEmailGroups) {
    return {} as const satisfies Prisma.GroupWhereInput
  }

  return {
    NOT: {
      type: "EMAIL_ONLY",
    },
  } as const satisfies Prisma.GroupWhereInput
}

function compareGroupsByMembership(
  leftGroup: { type: GroupType; memberships: Pick<GroupMembership, "start" | "end">[] },
  rightGroup: { type: GroupType; memberships: Pick<GroupMembership, "start" | "end">[] },
  now: Date
) {
  const typeDifference = GROUP_TYPE_SORT_ORDER[leftGroup.type] - GROUP_TYPE_SORT_ORDER[rightGroup.type]

  if (typeDifference !== 0) {
    return typeDifference
  }

  const leftDuration = getMembershipDurationMilliseconds(leftGroup.memberships, now)
  const rightDuration = getMembershipDurationMilliseconds(rightGroup.memberships, now)

  return rightDuration - leftDuration
}

function getMembershipDurationMilliseconds(memberships: Pick<GroupMembership, "start" | "end">[], now: Date) {
  return memberships.reduce((totalDuration, membership) => {
    const membershipEnd = membership.end ?? now
    const membershipDuration = differenceInMilliseconds(membershipEnd, membership.start)

    return totalDuration + Math.max(0, membershipDuration)
  }, 0)
}

function getMembershipFilterForUser(userId: UserId, includeEmailOnlyMemberships: boolean) {
  if (includeEmailOnlyMemberships) {
    return {
      userId,
    } as const satisfies Prisma.GroupMembershipWhereInput
  }

  return {
    userId,
    roles: {
      some: {
        role: {
          type: {
            not: "EMAIL_ONLY" as const,
          },
        },
      },
    },
  } as const satisfies Prisma.GroupMembershipWhereInput
}
