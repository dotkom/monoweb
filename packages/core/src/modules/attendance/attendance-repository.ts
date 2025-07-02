import type { DBClient } from "@dotkomonline/db"
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
  create(data: AttendanceWrite): Promise<Attendance>
  delete(attendanceId: AttendanceId): Promise<Attendance>
  getById(attendanceId: AttendanceId): Promise<Attendance | null>
  getByAttendeeId(attendeeId: AttendeeId): Promise<Attendance | null>
  getByIds(attendanceIds: AttendanceId[]): Promise<Map<AttendanceId, Attendance>>
  update(attendanceId: AttendanceId, data: Partial<AttendanceWrite>): Promise<Attendance>
  getAll(): Promise<Attendance[]>

  getPoolById(attendancePoolId: AttendancePoolId): Promise<AttendancePool | null>
  getPoolByAttendeeId(attendeeId: AttendeeId): Promise<AttendancePool | null>
  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(attendancePoolId: AttendancePoolId): Promise<AttendancePool>
  updatePool(attendancePoolId: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getAll() {
    const attendances = await this.db.attendance.findMany({
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    return attendances.map(this.mapAttendance)
  }

  public async create(data: AttendanceWrite) {
    const createdAttendance = await this.db.attendance.create({
      data,
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    return this.mapAttendance(createdAttendance)
  }

  public async update(attendanceId: AttendanceId, data: Partial<AttendanceWrite>) {
    const updatedAttendance = await this.db.attendance.update({
      data,
      where: { id: attendanceId },
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    return this.mapAttendance(updatedAttendance)
  }

  public async delete(attendanceId: AttendanceId) {
    const deletedAttendance = await this.db.attendance.delete({
      where: { id: attendanceId },
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })
    return this.mapAttendance(deletedAttendance)
  }

  public async getById(attendanceId: AttendanceId) {
    const attendance = await this.db.attendance.findUnique({
      where: { id: attendanceId },
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    return attendance && this.mapAttendance(attendance)
  }

  public async getByAttendeeId(attendeeId: AttendeeId) {
    const attendance = await this.db.attendance.findFirst({
      where: {
        attendees: {
          some: {
            id: attendeeId,
          },
        },
      },
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    return attendance && this.mapAttendance(attendance)
  }

  public async getByIds(attendanceIds: AttendanceId[]) {
    const attendances = await this.db.attendance.findMany({
      where: { id: { in: attendanceIds } },
      include: ATTENDANCE_ATTENDEE_COUNT_INCLUDE,
    })

    const result = new Map<AttendanceId, Attendance>()

    for (const attendance of attendances) {
      result.set(attendance.id, this.mapAttendance(attendance))
    }

    return result
  }

  public async createPool(data: AttendancePoolWrite) {
    const createdPool = await this.db.attendancePool.create({
      data,
      include: POOL_ATTENDEE_COUNT_INCLUDE,
    })

    return this.validateAttendancePool(createdPool)
  }

  public async deletePool(attendancePoolId: AttendancePoolId) {
    const deletedPool = await this.db.attendancePool.delete({
      where: { id: attendancePoolId },
      include: POOL_ATTENDEE_COUNT_INCLUDE,
    })

    return this.validateAttendancePool(deletedPool)
  }

  public async updatePool(attendancePoolId: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    const updatedPool = await this.db.attendancePool.update({
      where: { id: attendancePoolId },
      data,
      include: POOL_ATTENDEE_COUNT_INCLUDE,
    })

    return this.validateAttendancePool(updatedPool)
  }

  public async getPoolById(attendancePoolId: AttendancePoolId) {
    const pool = await this.db.attendancePool.findUnique({
      where: { id: attendancePoolId },
      include: POOL_ATTENDEE_COUNT_INCLUDE,
    })

    if (!pool) {
      return null
    }

    return this.validateAttendancePool(pool)
  }

  public async getPoolByAttendeeId(attendeeId: AttendeeId) {
    const pool = await this.db.attendancePool.findFirst({
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

    return this.validateAttendancePool(pool)
  }

  /**
   * Parses the selections with AttendanceSelectionSchema and maps the pools
   */
  private mapAttendance({
    selections,
    pools,
    ...attendance
  }: DBAttendance & { pools: UnmappedAttendancePool[] }): Attendance {
    return {
      ...attendance,
      selections: z.array(AttendanceSelectionSchema).parse(selections),
      pools: pools.map(this.validateAttendancePool),
    }
  }

  private validateAttendancePool({
    _count: { attendees: totalAttendees },
    yearCriteria,
    ...attendee
  }: UnmappedAttendancePool): AttendancePool {
    // TODO: fix this
    const numAttendees = Math.min(totalAttendees, attendee.capacity)
    const numUnreservedAttendees = Math.max(0, totalAttendees - numAttendees)
    return { numAttendees, numUnreservedAttendees, yearCriteria: YearCriteriaSchema.parse(yearCriteria), ...attendee }
  }
}
