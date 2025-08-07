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
  AttendeeSchema,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"

export interface AttendanceRepository {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  updateAttendanceById(handle: DBHandle, attendanceId: AttendanceId, data: AttendanceWrite): Promise<Attendance>

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
          attendees: true,
        },
      })
      if (attendance === null) {
        return null
      }
      return parseOrReport(AttendanceSchema, attendance)
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
          user: true,
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
          user: true,
        },
      })
      return parseOrReport(AttendeeSchema.nullable(), attendee)
    },
    async updateAttendeeById(handle, attendeeId, data) {
      const attendee = await handle.attendee.update({
        where: { id: attendeeId },
        data,
        include: {
          user: true,
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
    async deleteAttendancePoolsByIds(handle, attendancePoolIds) {
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
