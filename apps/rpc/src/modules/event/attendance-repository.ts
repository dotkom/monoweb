import type { DBHandle } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  AttendancePoolSchema,
  type AttendancePoolWrite,
  AttendanceSchema,
  type AttendanceWrite,
  type Attendee,
  type AttendeeId,
  type AttendeePaymentWrite,
  AttendeeSchema,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"

export interface AttendanceRepository {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  findAttendancesByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Attendance[]>
  findAttendanceByPoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendance | null>
  findAttendanceByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance | null>
  findAttendanceByAttendeePaymentId(handle: DBHandle, attendeePaymentId: string): Promise<Attendance | null>
  updateAttendanceById(handle: DBHandle, attendanceId: AttendanceId, data: AttendanceWrite): Promise<Attendance>
  updateAttendancePaymentPrice(handle: DBHandle, attendanceId: AttendanceId, price: number): Promise<Attendance>

  createAttendee(
    handle: DBHandle,
    attendanceId: AttendanceId,
    attendancePoolId: AttendancePoolId,
    userId: UserId,
    data: AttendeeWrite
  ): Promise<Attendee>
  deleteAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  findAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendee | null>
  updateAttendeeById(handle: DBHandle, attendeeId: AttendeeId, data: AttendeeWrite): Promise<Attendee>
  updateAttendeePaymentById(
    handle: DBHandle,
    attendeeId: AttendeeId,
    data: Partial<AttendeePaymentWrite>
  ): Promise<Attendee>
  /** Move all attendees from one of multiple old pools to a new pool. */
  updateAttendeeAttendancePoolIdByAttendancePoolIds(
    handle: DBHandle,
    previous: AttendancePoolId[],
    next: AttendancePoolId
  ): Promise<void>

  createAttendancePool(handle: DBHandle, attendanceId: AttendanceId, data: AttendancePoolWrite): Promise<AttendancePool>
  findAttendancePoolById(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool | null>
  updateAttendancePoolById(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId,
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
        where: { id: attendanceId },
        include: {
          pools: true,
          attendees: {
            include: {
              user: {
                include: {
                  memberships: true,
                },
              },
            },
          },
        },
      })
      return parseOrReport(AttendanceSchema.nullable(), attendance)
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
            include: {
              user: {
                include: {
                  memberships: true,
                },
              },
            },
          },
        },
      })
      return attendances.map((attendance) => parseOrReport(AttendanceSchema, attendance))
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
            include: {
              user: {
                include: {
                  memberships: true,
                },
              },
            },
          },
        },
      })
      return parseOrReport(AttendanceSchema.nullable(), attendance)
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
            include: {
              user: {
                include: {
                  memberships: true,
                },
              },
            },
          },
        },
      })
      return parseOrReport(AttendanceSchema.nullable(), attendance)
    },
    async findAttendanceByAttendeePaymentId(handle, attendeePaymentId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          attendees: {
            some: {
              paymentId: attendeePaymentId,
            },
          },
        },
        include: {
          pools: true,
          attendees: {
            include: {
              user: {
                include: {
                  memberships: true,
                },
              },
            },
          },
        },
      })
      return parseOrReport(AttendanceSchema.nullable(), attendance)
    },
    async updateAttendanceById(handle, attendanceId, data) {
      const row = await handle.attendance.update({
        where: { id: attendanceId },
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
      previous: AttendancePoolId[],
      next: AttendancePoolId
    ) {
      await handle.attendee.updateMany({
        where: {
          attendancePoolId: {
            in: previous,
          },
        },
        data: {
          attendancePoolId: next,
        },
      })
    },
    async updateAttendancePaymentPrice(handle, attendanceId, price) {
      const row = await handle.attendance.update({
        where: { id: attendanceId },
        data: {
          attendancePrice: price,
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
      const attendee = await handle.attendee.create({
        data: {
          ...data,
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
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
        },
      })
      return parseOrReport(AttendeeSchema, attendee)
    },
    async deleteAttendeeById(handle, attendeeId) {
      await handle.attendee.delete({
        where: { id: attendeeId },
      })
    },
    async findAttendeeById(handle, attendeeId) {
      const attendee = await handle.attendee.findUnique({
        where: { id: attendeeId },
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
        },
      })
      return parseOrReport(AttendeeSchema.nullable(), attendee)
    },
    async updateAttendeeById(handle, attendeeId, data) {
      const attendee = await handle.attendee.update({
        where: { id: attendeeId },
        data,
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
        },
      })
      return parseOrReport(AttendeeSchema, attendee)
    },
    async updateAttendeePaymentById(handle, attendeeId, data) {
      const attendee = await handle.attendee.update({
        where: { id: attendeeId },
        data,
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
        },
      })
      return parseOrReport(AttendeeSchema, attendee)
    },
    async createAttendancePool(handle, attendanceId, data) {
      const pool = await handle.attendancePool.create({
        data: {
          ...data,
          attendanceId,
        },
      })
      return parseOrReport(AttendancePoolSchema, pool)
    },
    async findAttendancePoolById(handle, attendancePoolId) {
      const pool = await handle.attendancePool.findUnique({
        where: { id: attendancePoolId },
      })
      return parseOrReport(AttendancePoolSchema.nullable(), pool)
    },
    async updateAttendancePoolById(handle, attendancePoolId, data) {
      const pool = await handle.attendancePool.update({
        where: { id: attendancePoolId },
        data,
      })
      return parseOrReport(AttendancePoolSchema, pool)
    },
    async deleteAttendancePoolById(handle, attendancePoolId) {
      await handle.attendancePool.delete({
        where: { id: attendancePoolId },
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
  }
}
