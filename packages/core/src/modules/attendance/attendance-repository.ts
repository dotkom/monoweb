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
import type { Attendance as DBAttendance, AttendancePool as DBAttendancePool } from "@prisma/client"
import { z } from "zod"
import { AttendanceNotFound } from "./attendance-error"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"

export interface AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<Attendance>
  getById(id: AttendanceId): Promise<Attendance>
  getByAttendeeId(id: AttendeeId): Promise<Attendance>
  update(data: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
  getAll(): Promise<Attendance[]>
  getPoolById(id: AttendancePoolId): Promise<AttendancePool>
  createPool(data: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(id: AttendancePoolId): Promise<AttendancePool>
  updatePool(id: AttendancePoolId, data: Partial<AttendancePoolWrite>): Promise<AttendancePool>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private includePoolAttendeeCount = {
    _count: {
      select: {
        attendees: {
          where: {
            reserved: true,
          },
        },
      },
    },
  }

  private includePools = {
    pools: {
      include: this.includePoolAttendeeCount,
    },
  }

  async getAll() {
    const attendances = await this.db.attendance.findMany({
      include: this.includePools,
    })

    return attendances.map(this.mapAttendance)
  }

  async create(data: AttendanceWrite) {
    const createdAttendance = await this.db.attendance.create({
      data,
      include: this.includePools,
    })

    return this.mapAttendance(createdAttendance)
  }

  async update(data: Partial<AttendanceWrite>, id: AttendanceId) {
    const updatedAttendance = await this.db.attendance.update({
      data,
      where: { id },
      include: this.includePools,
    })

    return this.mapAttendance(updatedAttendance)
  }

  async delete(id: AttendanceId) {
    const deletedAttendance = await this.db.attendance.delete({
      where: { id },
      include: this.includePools,
    })
    return this.mapAttendance(deletedAttendance)
  }

  async getById(id: AttendanceId) {
    const attendance = await this.db.attendance.findUnique({
      where: { id },
      include: this.includePools,
    })

    if (!attendance) {
      throw new AttendanceNotFound(id)
    }

    return this.mapAttendance(attendance)
  }

  async getByAttendeeId(id: AttendeeId): Promise<Attendance> {
    const attendance = await this.db.attendance.findFirst({
      where: {
        attendees: {
          some: {
            id,
          },
        },
      },
      include: this.includePools,
    })

    if (attendance === null) {
      throw new AttendanceNotFound(id)
    }

    return this.mapAttendance(attendance)
  }

  async createPool(data: AttendancePoolWrite) {
    const createdPool = await this.db.attendancePool.create({
      data,
      include: this.includePoolAttendeeCount,
    })

    return this.validateAttendancePool(createdPool)
  }

  async deletePool(id: AttendancePoolId) {
    const deletedPool = await this.db.attendancePool.delete({
      where: { id },
      include: this.includePoolAttendeeCount,
    })

    return this.validateAttendancePool(deletedPool)
  }

  async updatePool(id: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    const updatedPool = await this.db.attendancePool.update({
      where: { id },
      data,
      include: this.includePoolAttendeeCount,
    })

    return this.validateAttendancePool(updatedPool)
  }

  async getPoolById(id: AttendancePoolId) {
    const pool = await this.db.attendancePool.findUnique({
      where: { id },
      include: this.includePoolAttendeeCount,
    })

    if (pool === null) {
      throw new AttendancePoolNotFoundError("Attendance pool not found")
    }

    return this.validateAttendancePool(pool)
  }

  /** Parses the selections with AttendanceSelectionSchema and maps the pools */
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
    _count: { attendees: numAttendees },
    yearCriteria,
    ...attendee
  }: UnmappedAttendancePool): AttendancePool {
    return { numAttendees, yearCriteria: YearCriteriaSchema.parse(yearCriteria), ...attendee }
  }
}

type UnmappedAttendancePool = DBAttendancePool & { _count: { attendees: number } }
