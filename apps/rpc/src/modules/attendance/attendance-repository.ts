import type { DBHandle } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  AttendancePoolSchema,
  type AttendancePoolWrite,
  AttendanceSchema,
  AttendanceSelectionSchema,
  type AttendanceWrite,
  type AttendeeId,
  YearCriteriaSchema,
} from "@dotkomonline/types"
import type { Attendance as DBAttendance, AttendancePool as DBAttendancePool, Prisma } from "@prisma/client"
import { z } from "zod"
import { parseOrReport } from "../../invariant"

type UnmappedAttendancePool = DBAttendancePool & { _count: { attendees: number } }

const POOL_ATTENDEE_COUNT_INCLUDE = {
  _count: {
    select: {
      attendees: true,
    },
  },
} satisfies Prisma.AttendancePoolInclude

const ATTENDANCE_ATTENDEE_COUNT_INCLUDE = {
  pools: {
    include: POOL_ATTENDEE_COUNT_INCLUDE,
  },
} satisfies Prisma.AttendanceInclude

export interface AttendanceRepository {
  create(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  delete(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  findById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  updateById(handle: DBHandle, attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>

  getPoolById(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool | null>
  getPoolByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<AttendancePool | null>
  addAttendancePool(handle: DBHandle, data: AttendancePoolWrite): Promise<AttendancePool>
  removeAttendancePool(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updateAttendancePool(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId,
    data: Partial<AttendancePoolWrite>
  ): Promise<AttendancePool>
}

export function getAttendanceRepository(): AttendanceRepository {
  return {
    async create(handle, data) {
      const attendance = await handle.attendance.create({
        data,
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return mapAttendance(attendance)
    },
    async delete(handle, attendanceId) {
      const deletedAttendance = await handle.attendance.delete({
        where: { id: attendanceId },
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return mapAttendance(deletedAttendance)
    },
    async findById(handle, attendanceId) {
      const attendance = await handle.attendance.findUnique({
        where: { id: attendanceId },
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return attendance ? mapAttendance(attendance) : null
    },
    async updateById(handle, attendanceId, data) {
      const updatedAttendance = await handle.attendance.update({
        where: { id: attendanceId },
        data,
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return mapAttendance(updatedAttendance)
    },
    async getPoolById(handle, attendancePoolId) {
      const pool = await handle.attendancePool.findUnique({
        where: { id: attendancePoolId },
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      if (!pool) {
        return null
      }
      return validateAttendancePool(pool)
    },
    async getPoolByAttendeeId(handle, attendeeId) {
      const pool = await handle.attendancePool.findFirst({
        where: {
          attendees: {
            some: {
              id: attendeeId,
            },
          },
        },
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      if (!pool) {
        return null
      }
      return validateAttendancePool(pool)
    },
    async addAttendancePool(handle, data) {
      const createdPool = await handle.attendancePool.create({
        data,
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      return validateAttendancePool(createdPool)
    },
    async removeAttendancePool(handle, attendancePoolId) {
      const deletedPool = await handle.attendancePool.delete({
        where: { id: attendancePoolId },
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      return validateAttendancePool(deletedPool)
    },
    async updateAttendancePool(handle, attendancePoolId, data) {
      const updatedPool = await handle.attendancePool.update({
        where: { id: attendancePoolId },
        data,
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      return validateAttendancePool(updatedPool)
    },
  }
}

/**
 * Parses the selections with AttendanceSelectionSchema and maps the pools
 */
function mapAttendance({
  selections,
  pools,
  ...attendance
}: DBAttendance & { pools: UnmappedAttendancePool[] }): Attendance {
  return parseOrReport(AttendanceSchema, {
    ...attendance,
    selections: z.array(AttendanceSelectionSchema).parse(selections),
    pools: pools.map(validateAttendancePool),
  })
}

function validateAttendancePool({
  _count: { attendees: totalAttendees },
  yearCriteria,
  ...attendee
}: UnmappedAttendancePool): AttendancePool {
  // TODO: fix this
  const numAttendees = Math.min(totalAttendees, attendee.capacity)
  const numUnreservedAttendees = Math.max(0, totalAttendees - numAttendees)
  return parseOrReport(AttendancePoolSchema, {
    numAttendees,
    numUnreservedAttendees,
    yearCriteria: YearCriteriaSchema.parse(yearCriteria),
    ...attendee,
  })
}
