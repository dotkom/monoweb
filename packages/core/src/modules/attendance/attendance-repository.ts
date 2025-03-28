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

export interface AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<Attendance | null>
  getById(id: AttendanceId): Promise<Attendance | null>
  getByAttendeeId(id: AttendeeId): Promise<Attendance | null>
  update(data: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
  getAll(): Promise<Attendance[]>
  getPool(id: AttendancePoolId): Promise<AttendancePool | null>
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
        attendees: true,
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

    if (!attendance) return null

    return this.mapAttendance(attendance)
  }

  async getByAttendeeId(id: AttendeeId): Promise<Attendance | null> {
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

    if (attendance === null) return null

    return this.mapAttendance(attendance)
  }

  async createPool(data: AttendancePoolWrite) {
    const createdPool = await this.db.attendancePool.create({
      data,
      include: this.includePoolAttendeeCount,
    })

    return this.mapAttendancePool(createdPool)
  }

  async deletePool(id: AttendancePoolId) {
    const deletedPool = await this.db.attendancePool.delete({
      where: { id },
      include: this.includePoolAttendeeCount,
    })

    return this.mapAttendancePool(deletedPool)
  }

  async updatePool(id: AttendancePoolId, data: Partial<AttendancePoolWrite>) {
    const updatedPool = await this.db.attendancePool.update({
      where: { id },
      data,
      include: this.includePoolAttendeeCount,
    })

    return this.mapAttendancePool(updatedPool)
  }

  async getPool(id: AttendancePoolId) {
    const pool = await this.db.attendancePool.findUnique({ where: { id }, include: this.includePoolAttendeeCount })

    if (pool === null) return null

    return this.mapAttendancePool(pool)
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
      pools: pools.map(this.mapAttendancePool),
    }
  }

  /** Renames _count on the prisma response for an attendee to numAttendees and parses the yearCriteria */
  private mapAttendancePool({
                              _count: { attendees: numAttendees },
                              yearCriteria,
                              ...attendee
                            }: UnmappedAttendancePool): AttendancePool {
    return { numAttendees, ...attendee, yearCriteria: YearCriteriaSchema.parse(yearCriteria) }
  }
}

type UnmappedAttendancePool = DBAttendancePool & { _count: { attendees: number } }