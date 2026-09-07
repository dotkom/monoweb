import type { DBHandle, Prisma } from "@dotkomonline/db"
import type { AttendanceId } from "../event/attendance"
import { getGroupDisplayName, type GroupId } from "../group/group"
import type { UserId } from "../user/user"
import type {
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientMembershipStatus,
  NotificationRecipientMembershipType,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
} from "./notification"
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

export interface FindAllUserIdsOptions {
  membershipStatus: NotificationRecipientMembershipStatus
  membershipTypes: NotificationRecipientMembershipType[] | undefined
  studyGrades: number[] | undefined
  requiresActiveCommitteeMembership: boolean
}

export interface FindAttendeeUserIdsOptions {
  reservationStatus: NotificationRecipientReservationStatus
  paymentStatus: NotificationRecipientPaymentStatus
  attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | undefined
}

export interface NotificationRecipientQueryRepository {
  findAllUserIds(handle: DBHandle, options: FindAllUserIdsOptions): Promise<UserId[]>
  findGroupMemberUserIds(
    handle: DBHandle,
    groupSlug: GroupId,
    options: { includeFormerMembers: boolean }
  ): Promise<GroupMemberUserIds | null>
  findAttendeeUserIds(
    handle: DBHandle,
    attendanceId: AttendanceId,
    options: FindAttendeeUserIdsOptions
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

const paidAttendeePaymentConditions: Prisma.AttendeeWhereInput[] = [
  { paymentChargedAt: { not: null } },
  { paymentReservedAt: { not: null } },
  {
    AND: [{ paymentRefundedAt: { not: null } }, { paymentDeadline: null }],
  },
]

export function buildAttendeeSelectionFilter(options: FindAttendeeUserIdsOptions): Prisma.AttendeeWhereInput {
  const attendeeFilter: Prisma.AttendeeWhereInput = {}

  if (options.reservationStatus === "RESERVED") {
    attendeeFilter.reserved = true
  }

  if (options.reservationStatus === "UNRESERVED") {
    attendeeFilter.reserved = false
  }

  const extraFilters: Prisma.AttendeeWhereInput[] = []

  if (options.paymentStatus === "PAID") {
    extraFilters.push({
      OR: paidAttendeePaymentConditions,
    })
  }

  if (options.paymentStatus === "UNPAID") {
    extraFilters.push({
      NOT: {
        OR: paidAttendeePaymentConditions,
      },
    })
  }

  if (options.attendanceSelectionOptions !== undefined) {
    extraFilters.push({
      OR: options.attendanceSelectionOptions.map((selectionOption) => ({
        selections: {
          array_contains: [{ selectionId: selectionOption.selectionId, optionId: selectionOption.optionId }],
        },
      })),
    })
  }

  if (extraFilters.length === 1) {
    const extraFilter = extraFilters[0]

    if (extraFilter === undefined) {
      return attendeeFilter
    }

    return {
      ...attendeeFilter,
      ...extraFilter,
    }
  }

  if (extraFilters.length > 1) {
    attendeeFilter.AND = extraFilters
  }

  return attendeeFilter
}

function getActiveDateRangeFilter(currentTime: Date) {
  return {
    start: {
      lte: currentTime,
    },
    OR: [{ end: null }, { end: { gt: currentTime } }],
  }
}

function getSemestersForStudyGrades(studyGrades: number[]): number[] {
  const semesters: number[] = []

  for (const studyGrade of studyGrades) {
    semesters.push(studyGrade * 2 - 2)
    semesters.push(studyGrade * 2 - 1)
  }

  return semesters
}

function isDatabaseMembershipType(
  membershipType: NotificationRecipientMembershipType
): membershipType is Exclude<NotificationRecipientMembershipType, "NONE"> {
  return membershipType !== "NONE"
}

export function buildAllUsersSelectionFilter(currentTime: Date, options: FindAllUserIdsOptions): Prisma.UserWhereInput {
  const selectedMembershipTypes = options.membershipTypes ?? []
  const includesNoneMembershipType = selectedMembershipTypes.includes("NONE")
  const databaseMembershipTypes = selectedMembershipTypes.filter(isDatabaseMembershipType)
  const hasDatabaseMembershipTypes = databaseMembershipTypes.length > 0
  const studyGrades = options.studyGrades
  const hasStudyGradeFilter = studyGrades !== undefined
  const hasActiveMembershipStatus = options.membershipStatus === "ACTIVE"
  const studyGradeSemesters = hasStudyGradeFilter ? getSemestersForStudyGrades(studyGrades) : []

  const matchingMembershipFilter: Prisma.MembershipWhereInput = {}
  let noneMembershipFilter: Prisma.MembershipWhereInput = {}

  if (hasActiveMembershipStatus) {
    const activeDateRangeFilter = getActiveDateRangeFilter(currentTime)
    matchingMembershipFilter.start = activeDateRangeFilter.start
    matchingMembershipFilter.OR = activeDateRangeFilter.OR
    noneMembershipFilter = activeDateRangeFilter
  }

  if (hasDatabaseMembershipTypes) {
    matchingMembershipFilter.type = {
      in: databaseMembershipTypes,
    }
  }

  if (hasStudyGradeFilter) {
    matchingMembershipFilter.semester = {
      in: studyGradeSemesters,
    }
  }

  const userFilters: Prisma.UserWhereInput[] = []
  const hasMatchingMembershipConstraint = hasActiveMembershipStatus || hasDatabaseMembershipTypes || hasStudyGradeFilter
  const shouldIncludeNoneWithMatchingMemberships =
    includesNoneMembershipType && (hasDatabaseMembershipTypes || hasStudyGradeFilter)
  const shouldMatchMembershipsOnly = hasMatchingMembershipConstraint && !includesNoneMembershipType

  if (shouldIncludeNoneWithMatchingMemberships) {
    userFilters.push({
      OR: [{ memberships: { some: matchingMembershipFilter } }, { memberships: { none: noneMembershipFilter } }],
    })
  } else if (shouldMatchMembershipsOnly) {
    userFilters.push({
      memberships: {
        some: matchingMembershipFilter,
      },
    })
  } else if (includesNoneMembershipType) {
    userFilters.push({
      memberships: {
        none: noneMembershipFilter,
      },
    })
  }

  if (options.requiresActiveCommitteeMembership) {
    userFilters.push({
      groupMemberships: {
        some: {
          ...buildGroupMembershipSelectionFilter(currentTime, false),
          group: {
            type: {
              in: ["COMMITTEE", "NODE_COMMITTEE"],
            },
          },
        },
      },
    })
  }

  if (userFilters.length === 0) {
    return {}
  }

  if (userFilters.length === 1) {
    const userFilter = userFilters[0]

    if (userFilter === undefined) {
      return {}
    }

    return userFilter
  }

  return {
    AND: userFilters,
  }
}

export function getNotificationRecipientQueryRepository(): NotificationRecipientQueryRepository {
  return {
    async findAllUserIds(handle, options) {
      const rows = await handle.user.findMany({
        where: buildAllUsersSelectionFilter(new Date(), options),
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
          preferredDisplayName: true,
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
        groupName: getGroupDisplayName(group),
        userIds: Array.from(uniqueUserIds),
      }
    },

    async findAttendeeUserIds(handle, attendanceId, options) {
      const attendeeFilter = buildAttendeeSelectionFilter(options)

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
