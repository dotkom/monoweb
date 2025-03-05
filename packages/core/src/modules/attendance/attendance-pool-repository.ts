import type { DBClient } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWithoutAttendeeCount,
  type AttendancePoolWrite,
  type YearCriteria,
  YearCriteriaSchema,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"

export interface AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePoolWithoutAttendeeCount>
  delete(id: AttendancePoolId): Promise<AttendancePoolWithoutAttendeeCount | null>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePool[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePoolWithoutAttendeeCount | null>
  get(id: AttendancePoolId): Promise<AttendancePool | null>
  getNumAttendees(id: AttendancePoolId): Promise<number>
}

export class AttendancePoolRepositoryImpl implements AttendancePoolRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async get(id: AttendancePoolId) {
    const poolData = await this.db.attendancePool.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    })

    if (poolData === null) return null

    const { _count, ...pool } = poolData

    return this.parseYearCriteria({ ...pool, numAttendees: _count.attendees })
  }

  async create(data: AttendancePoolWrite) {
    const createdAttendancePool = await this.db.attendancePool.create({ data })

    return this.parseYearCriteria(createdAttendancePool)
  }

  async delete(id: AttendancePoolId) {
    const deletedAttendancePool = await this.db.attendancePool.delete({ where: { id } })

    return this.parseYearCriteria(deletedAttendancePool)
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const attendancePools = await this.db.attendancePool.findMany({
      where: { attendanceId },
      include: {
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    })

    return attendancePools.map(({ _count, ...attendancePool }) =>
      this.parseYearCriteria({ ...attendancePool, numAttendees: _count.attendees })
    )
  }

  async update(data: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const updatedAttendancePool = await this.db.attendancePool.update({ where: { id }, data })

    return this.parseYearCriteria(updatedAttendancePool)
  }

  async getNumAttendees(id: AttendancePoolId) {
    return this.db.attendee.count({ where: { attendancePoolId: id } })
  }

  // Takes an object with unparsed JSON value yearCriteria and returns it with yearCriteria parsed
  private parseYearCriteria<T extends { yearCriteria: JsonValue }>(
    unparsedObj: T
  ): Omit<T, "yearCriteria"> & { yearCriteria: YearCriteria } {
    const { yearCriteria, ...attendancePool } = unparsedObj

    return { ...attendancePool, yearCriteria: YearCriteriaSchema.parse(yearCriteria) }
  }
}
