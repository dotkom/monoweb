import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  AttendancePoolSchema,
  type AttendancePoolWrite,
  AttendanceSchema,
  type AttendanceSummary,
  AttendanceSummarySchema,
  type AttendanceWrite,
  type Attendee,
  type AttendeeId,
  AttendeeSchema,
  type AttendeeWrite,
  getAttendeeRegistrationEligibleAt,
} from "./attendance"
import type { EventId } from "./event"
import { buildPaymentView, type PaymentRecord } from "../payment/payment"
import { paymentInclude } from "../payment/payment-repository"
import type { TaskId } from "../task/task"
import { type UserId, normalizeDbUser } from "../user/user"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import { compareAsc } from "date-fns"

const attendeeInclude = {
  payment: {
    include: paymentInclude,
  },
  user: {
    include: {
      memberships: true,
      userFlagLinks: {
        include: {
          userFlag: true,
        },
      },
    },
  },
} satisfies Prisma.AttendeeInclude

type AttendeeWithRelations = Pick<
  Attendee,
  "createdAt" | "registrationPoolDelayHours" | "registrationMarkDelayHours"
> & {
  payment: PaymentRecord | null
  user: Parameters<typeof normalizeDbUser>[0]
  [key: string]: unknown
}

function normalizeAttendee<T extends AttendeeWithRelations>(attendee: T) {
  return {
    ...attendee,
    payment: attendee.payment === null ? null : buildPaymentView(attendee.payment),
    registrationEligibleAt: getAttendeeRegistrationEligibleAt(attendee),
    user: normalizeDbUser(attendee.user),
  }
}

function normalizeAttendance<T extends { attendees: AttendeeWithRelations[]; [key: string]: unknown }>(attendance: T) {
  return {
    ...attendance,
    attendees: attendance.attendees
      .map(normalizeAttendee)
      .toSorted((firstAttendee, secondAttendee) =>
        compareAsc(firstAttendee.registrationEligibleAt, secondAttendee.registrationEligibleAt)
      ),
  }
}

export interface AttendanceRepository {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  deleteAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<void>
  updateAttendanceById(handle: DBHandle, attendanceId: AttendanceId, data: AttendanceWrite): Promise<Attendance>
  updateAttendancePaymentPrice(
    handle: DBHandle,
    attendanceId: AttendanceId,
    priceNok: number | null
  ): Promise<Attendance>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  findAttendancesByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Attendance[]>
  findAttendanceSummariesByIds(handle: DBHandle, eventIds: EventId[], userId?: UserId): Promise<AttendanceSummary[]>
  findAttendanceByPoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendance | null>
  findAttendanceByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance | null>
  findAttendanceByAttendeePaymentId(handle: DBHandle, attendeePaymentId: string): Promise<Attendance | null>
  findAttendanceByEventId(handle: DBHandle, eventId: EventId): Promise<Attendance | null>

  createAttendee(
    handle: DBHandle,
    attendanceId: AttendanceId,
    attendancePoolId: AttendancePoolId,
    userId: UserId,
    data: AttendeeWrite
  ): Promise<Attendee>
  deleteAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  findAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendee | null>
  findAttendeePaymentsByUserId(
    handle: DBHandle,
    userId: UserId
  ): Promise<Pick<Attendee, "id" | "attendanceId" | "payment">[]>
  updateAttendeeById(handle: DBHandle, attendeeId: AttendeeId, data: AttendeeWrite): Promise<Attendee>
  updateAttendeeCompletionDeadline(
    handle: DBHandle,
    attendeeId: AttendeeId,
    completionDeadline: Date | null
  ): Promise<Attendee>
  /**
   * Move all attendees from one of multiple old pools to a new pool.
   */
  updateAttendeeAttendancePoolIdByAttendancePoolIds(
    handle: DBHandle,
    fromPoolIds: AttendancePoolId[],
    toPoolId: AttendancePoolId
  ): Promise<void>

  createAttendancePool(
    handle: DBHandle,
    attendanceId: AttendanceId,
    mergeAttendancePoolsTaskId: TaskId | null,
    data: AttendancePoolWrite
  ): Promise<AttendancePool>
  findAttendancePoolById(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool | null>
  updateAttendancePoolById(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId,
    mergeAttendancePoolsTaskId: TaskId | null,
    data: Partial<AttendancePoolWrite>
  ): Promise<AttendancePool>
  deleteAttendancePoolById(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<void>
  deleteAttendancePoolsByIds(handle: DBHandle, attendancePoolIds: AttendancePoolId[]): Promise<void>
}

export function getAttendanceRepository(): AttendanceRepository {
  return {
    async createAttendance(handle, data) {
      const row = await handle.attendance.create({
        data,
        select: {
          id: true,
        },
      })

      const attendance = await this.findAttendanceById(handle, row.id)
      invariant(attendance !== null, "Created attendance should not be null")

      return attendance
    },

    async findAttendanceById(handle, attendanceId) {
      const attendance = await handle.attendance.findUnique({
        where: {
          id: attendanceId,
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return parseOrReport(AttendanceSchema.nullable(), attendance === null ? null : normalizeAttendance(attendance))
    },

    async findAttendancesByIds(handle, attendanceIds) {
      const attendances = await handle.attendance.findMany({
        where: {
          id: {
            in: attendanceIds,
          },
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return attendances.map((attendance) => parseOrReport(AttendanceSchema, normalizeAttendance(attendance)))
    },

    async findAttendanceSummariesByIds(handle, attendanceIds, userId) {
      const attendances = await handle.attendance.findMany({
        where: {
          id: {
            in: attendanceIds,
          },
        },
        include: {
          _count: {
            select: {
              attendees: {
                where: {
                  registeredAt: {
                    not: null,
                  },
                },
              },
            },
          },
          pools: true,
          attendees: {
            include: attendeeInclude,
            where: {
              userId,
            },
            take: 1,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      const attendanceSummaries = attendances.map((attendance) => {
        // We only need the attendee for the given user (if any)
        const currentAttendee = attendance.attendees.find((attendee) => attendee.userId === userId)

        return {
          ...attendance,
          currentUserAttendee: currentAttendee === undefined ? null : normalizeAttendee(currentAttendee),
          registeredAttendeeCount: attendance._count.attendees,
        }
      })

      return parseOrReport(AttendanceSummarySchema.array(), attendanceSummaries)
    },

    async findAttendanceByPoolId(handle, attendancePoolId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          pools: {
            some: {
              id: attendancePoolId,
            },
          },
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return parseOrReport(AttendanceSchema.nullable(), attendance === null ? null : normalizeAttendance(attendance))
    },

    async findAttendanceByAttendeeId(handle, attendeeId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          attendees: {
            some: {
              id: attendeeId,
            },
          },
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return parseOrReport(AttendanceSchema.nullable(), attendance === null ? null : normalizeAttendance(attendance))
    },

    async findAttendanceByAttendeePaymentId(handle, attendeePaymentId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          attendees: {
            some: {
              payment: {
                is: {
                  id: attendeePaymentId,
                },
              },
            },
          },
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return parseOrReport(AttendanceSchema.nullable(), attendance === null ? null : normalizeAttendance(attendance))
    },

    async findAttendanceByEventId(handle, eventId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          events: {
            some: {
              id: eventId,
            },
          },
        },
        include: {
          pools: true,
          attendees: {
            include: attendeeInclude,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })

      return parseOrReport(AttendanceSchema.nullable(), attendance === null ? null : normalizeAttendance(attendance))
    },

    async updateAttendanceById(handle, attendanceId, data) {
      const row = await handle.attendance.update({
        where: {
          id: attendanceId,
        },
        data,
        select: {
          id: true,
        },
      })

      const attendance = await this.findAttendanceById(handle, row.id)
      invariant(attendance !== null, "Updated attendance should not be null")
      return attendance
    },

    async updateAttendeeAttendancePoolIdByAttendancePoolIds(
      handle,
      fromPoolIds: AttendancePoolId[],
      toPoolId: AttendancePoolId
    ) {
      await handle.attendee.updateMany({
        where: {
          attendancePoolId: {
            in: fromPoolIds,
          },
        },
        data: {
          attendancePoolId: toPoolId,
        },
      })
    },

    async updateAttendancePaymentPrice(handle, attendanceId, priceNok) {
      const row = await handle.attendance.update({
        where: {
          id: attendanceId,
        },
        data: {
          attendancePrice: priceNok,
        },
        select: {
          id: true,
        },
      })

      const attendance = await this.findAttendanceById(handle, row.id)
      invariant(attendance !== null, "Updated attendance should not be null")
      return attendance
    },

    async createAttendee(handle, attendanceId, attendancePoolId, userId, data) {
      const { adminRegisteredByUserId, ...attendeeData } = data
      const attendee = await handle.attendee.create({
        data: {
          ...attendeeData,
          adminRegisteredBy:
            adminRegisteredByUserId === null ? undefined : { connect: { id: adminRegisteredByUserId } },
          attendance: {
            connect: { id: attendanceId },
          },
          attendancePool: {
            connect: { id: attendancePoolId },
          },
          user: {
            connect: { id: userId },
          },
        },
        include: attendeeInclude,
      })

      return parseOrReport(AttendeeSchema, normalizeAttendee(attendee))
    },

    async deleteAttendeeById(handle, attendeeId) {
      await handle.attendee.delete({
        where: {
          id: attendeeId,
        },
      })
    },

    async findAttendeeById(handle, attendeeId) {
      const attendee = await handle.attendee.findUnique({
        where: {
          id: attendeeId,
        },
        include: attendeeInclude,
      })

      return parseOrReport(AttendeeSchema.nullable(), attendee === null ? null : normalizeAttendee(attendee))
    },

    async findAttendeePaymentsByUserId(handle, userId) {
      const attendees = await handle.attendee.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          attendanceId: true,
          payment: {
            include: paymentInclude,
          },
        },
      })
      const schema = AttendeeSchema.pick({
        id: true,
        attendanceId: true,
        payment: true,
      }).array()
      const attendeePayments = attendees.map((attendee) => ({
        ...attendee,
        payment: attendee.payment === null ? null : buildPaymentView(attendee.payment),
      }))

      return parseOrReport(schema, attendeePayments)
    },

    async updateAttendeeById(handle, attendeeId, data) {
      const attendee = await handle.attendee.update({
        where: {
          id: attendeeId,
        },
        data,
        include: attendeeInclude,
      })

      return parseOrReport(AttendeeSchema, normalizeAttendee(attendee))
    },

    async updateAttendeeCompletionDeadline(handle, attendeeId, completionDeadline) {
      const attendee = await handle.attendee.update({
        where: {
          id: attendeeId,
        },
        data: {
          completionDeadline,
        },
        include: attendeeInclude,
      })

      return parseOrReport(AttendeeSchema, normalizeAttendee(attendee))
    },

    async createAttendancePool(handle, attendanceId, mergeAttendancePoolsTaskId, data) {
      const pool = await handle.attendancePool.create({
        data: {
          ...data,
          attendanceId,
          taskId: mergeAttendancePoolsTaskId,
        },
      })

      return parseOrReport(AttendancePoolSchema, pool)
    },

    async findAttendancePoolById(handle, attendancePoolId) {
      const pool = await handle.attendancePool.findUnique({
        where: {
          id: attendancePoolId,
        },
      })

      return parseOrReport(AttendancePoolSchema.nullable(), pool)
    },

    async updateAttendancePoolById(handle, attendancePoolId, mergeAttendancePoolsTaskId, data) {
      const pool = await handle.attendancePool.update({
        where: {
          id: attendancePoolId,
        },
        data: {
          ...data,
          taskId: mergeAttendancePoolsTaskId,
        },
      })

      return parseOrReport(AttendancePoolSchema, pool)
    },

    async deleteAttendancePoolById(handle, attendancePoolId) {
      await handle.attendancePool.delete({
        where: {
          id: attendancePoolId,
        },
      })
    },

    async deleteAttendancePoolsByIds(handle, attendancePoolIds) {
      // TODO: set a deleted flag instead of deleting
      await handle.attendancePool.deleteMany({
        where: {
          id: {
            in: attendancePoolIds,
          },
        },
      })
    },

    async deleteAttendanceById(handle, attendanceId) {
      await handle.event.updateMany({
        where: {
          attendanceId,
        },
        data: {
          attendanceId: null,
        },
      })

      await handle.attendance.delete({
        where: {
          id: attendanceId,
        },
      })
    },
  }
}
