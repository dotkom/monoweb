import type { DBHandle } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  AttendanceSelectionSchema,
  type AttendanceWrite,
  type AttendeeId,
  YearCriteriaSchema,
} from "@dotkomonline/types"
import type { Attendance as DBAttendance, AttendancePool as DBAttendancePool, Prisma } from "@prisma/client"
import { z } from "zod"

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
  delete(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance>
  getById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  getByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance | null>
  getByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Map<AttendanceId, Attendance>>
  update(handle: DBHandle, attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>
  getAll(handle: DBHandle): Promise<Attendance[]>

  getPoolById(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool | null>
  getPoolByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<AttendancePool | null>
  createPool(handle: DBHandle, data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(
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
    async getById(handle, attendanceId) {
      const attendance = await handle.attendance.findUnique({
        where: { id: attendanceId },
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return attendance ? mapAttendance(attendance) : null
    },
    async getByAttendeeId(handle, attendeeId) {
      const attendance = await handle.attendance.findFirst({
        where: {
          attendees: {
            some: {
              id: attendeeId,
            },
          },
        },
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return attendance ? mapAttendance(attendance) : null
    },
    async getByIds(handle, attendanceIds) {
      const attendances = await handle.attendance.findMany({
        where: { id: { in: attendanceIds } },
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })

      const result = new Map<AttendanceId, Attendance>()
      for (const attendance of attendances) {
        result.set(attendance.id, mapAttendance(attendance))
      }
      return result
    },
    async update(handle, attendanceId, data) {
      const updatedAttendance = await handle.attendance.update({
        where: { id: attendanceId },
        data,
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return mapAttendance(updatedAttendance)
    },
    async getAll(handle) {
      const attendances = await handle.attendance.findMany({
        include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
      })
      return attendances.map(mapAttendance)
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
    async createPool(handle, data) {
      const createdPool = await handle.attendancePool.create({
        data,
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      return validateAttendancePool(createdPool)
    },
    async deletePool(handle, attendancePoolId) {
      const deletedPool = await handle.attendancePool.delete({
        where: { id: attendancePoolId },
        include: POOL_ATTENDEE_COUNT_INCLUDE,
      })
      return validateAttendancePool(deletedPool)
    },
    async updatePool(handle, attendancePoolId, data) {
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
  return {
    ...attendance,
    selections: z.array(AttendanceSelectionSchema).parse(selections),
    pools: pools.map(validateAttendancePool),
  }
}

function validateAttendancePool({
  _count: { attendees: totalAttendees },
  yearCriteria,
  ...attendee
}: UnmappedAttendancePool): AttendancePool {
  // TODO: fix this
  const numAttendees = Math.min(totalAttendees, attendee.capacity)
  const numUnreservedAttendees = Math.max(0, totalAttendees - numAttendees)
  return { numAttendees, numUnreservedAttendees, yearCriteria: YearCriteriaSchema.parse(yearCriteria), ...attendee }
}
