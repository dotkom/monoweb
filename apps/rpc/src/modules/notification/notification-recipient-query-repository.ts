import type { DBHandle, Prisma } from "@dotkomonline/db"
import type { AttendanceId, AttendancePoolId } from "../event/attendance"
import type { GroupId } from "../group/group"
import type { UserId } from "../user/user"
import type { NotificationPermissionField } from "./notification-preferences"

export interface GroupMemberUserIds {
  groupName: string
  userIds: UserId[]
}

export interface AttendeeUserIds {
  eventTitle: string
  userIds: UserId[]
}

export interface RecipientUserSummary {
  id: UserId
  name: string | null
  imageUrl: string | null
}

export interface NotificationRecipientQueryRepository {
  findAllUserIds(handle: DBHandle): Promise<UserId[]>
  findGroupMemberUserIds(
    handle: DBHandle,
    groupSlug: GroupId,
    options: { includeFormerMembers: boolean }
  ): Promise<GroupMemberUserIds | null>
  findAttendeeUserIds(
    handle: DBHandle,
    attendanceId: AttendanceId,
    options: { includeUnreservedAttendees: boolean; attendancePoolIds: AttendancePoolId[] | undefined }
  ): Promise<AttendeeUserIds | null>
  filterExistingUserIds(handle: DBHandle, userIds: UserId[]): Promise<UserId[]>
  filterUserIdsByPreference(
    handle: DBHandle,
    userIds: UserId[],
    permissionField: NotificationPermissionField
  ): Promise<UserId[]>
  findUserSummaries(handle: DBHandle, userIds: UserId[]): Promise<RecipientUserSummary[]>
}

export function buildGroupMembershipSelectionFilter(
  currentTime: Date,
  includeFormerMembers: boolean
): Prisma.GroupMembershipWhereInput {
  const membershipFilter: Prisma.GroupMembershipWhereInput = {
    start: {
      lte: currentTime,
    },
  }

  if (!includeFormerMembers) {
    membershipFilter.OR = [{ end: null }, { end: { gt: currentTime } }]
  }

  return membershipFilter
}

export function getNotificationRecipientQueryRepository(): NotificationRecipientQueryRepository {
  return {
    async findAllUserIds(handle) {
      const rows = await handle.user.findMany({
        select: {
          id: true,
        },
      })

      return rows.map((row) => row.id)
    },

    async findGroupMemberUserIds(handle, groupSlug, options) {
      const currentTime = new Date()
      const membershipFilter = buildGroupMembershipSelectionFilter(currentTime, options.includeFormerMembers)

      const group = await handle.group.findUnique({
        where: {
          slug: groupSlug,
        },
        select: {
          name: true,
          abbreviation: true,
          memberships: {
            where: membershipFilter,
            select: {
              userId: true,
            },
          },
        },
      })

      if (group === null) {
        return null
      }

      const uniqueUserIds = new Set(group.memberships.map((membership) => membership.userId))

      return {
        groupName: group.name ?? group.abbreviation,
        userIds: Array.from(uniqueUserIds),
      }
    },

    async findAttendeeUserIds(handle, attendanceId, options) {
      const attendeeFilter: Prisma.AttendeeWhereInput = {}

      if (!options.includeUnreservedAttendees) {
        attendeeFilter.reserved = true
      }

      if (options.attendancePoolIds !== undefined) {
        attendeeFilter.attendancePoolId = {
          in: options.attendancePoolIds,
        }
      }

      const attendance = await handle.attendance.findUnique({
        where: {
          id: attendanceId,
        },
        select: {
          events: {
            select: {
              title: true,
            },
            take: 1,
          },
          attendees: {
            where: attendeeFilter,
            select: {
              userId: true,
            },
          },
        },
      })

      if (attendance === null) {
        return null
      }

      return {
        eventTitle: attendance.events[0]?.title ?? "Ukjent arrangement",
        userIds: attendance.attendees.map((attendee) => attendee.userId),
      }
    },

    async filterExistingUserIds(handle, userIds) {
      if (userIds.length === 0) {
        return []
      }

      const rows = await handle.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
        },
      })

      return rows.map((row) => row.id)
    },

    async filterUserIdsByPreference(handle, userIds, permissionField) {
      if (userIds.length === 0) {
        return []
      }

      // Users with no NotificationPermissions row are treated as opted in, which matches the column defaults.
      const rows = await handle.user.findMany({
        where: {
          id: {
            in: userIds,
          },
          OR: [{ notificationPermissions: null }, { notificationPermissions: { [permissionField]: true } }],
        },
        select: {
          id: true,
        },
      })

      return rows.map((row) => row.id)
    },

    async findUserSummaries(handle, userIds) {
      if (userIds.length === 0) {
        return []
      }

      return await handle.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      })
    },
  }
}
