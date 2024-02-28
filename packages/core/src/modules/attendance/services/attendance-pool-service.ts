import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWithNumAttendees,
  type AttendancePoolWrite,
  type EventId,
} from "@dotkomonline/types"
import { AttendanceRepository } from "../repositories"

export interface _AttendancePoolService {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  getByAttendanceId(id: string): Promise<AttendancePoolWithNumAttendees[]>
  getByEventId(id: EventId): Promise<AttendancePoolWithNumAttendees[]>
}

export class _PoolServiceImpl implements _AttendancePoolService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendanceRepository.pool.getByAttendanceId(id)
  }

  async getByEventId(id: EventId) {
    return this.attendanceRepository.pool.getByEventId(id)
  }

  async create(obj: AttendancePoolWrite): Promise<AttendancePool> {
    const res = await this.attendanceRepository.pool.create(obj)
    console.log(res)
    return res
  }

  async delete(id: AttendancePoolId): Promise<void> {
    await this.attendanceRepository.pool.delete(id)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool> {
    const res = await this.attendanceRepository.pool.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const pool = await this.attendanceRepository.pool.get(id)
      if (pool === undefined) {
        throw new Error("Pool not found")
      }
      return pool
    }

    throw new Error("TODO: decide on how to handle the case where the update fails")
  }

  async getPoolsByAttendanceId(attendanceId: string): Promise<AttendancePool[]> {
    return this.attendanceRepository.pool.getByAttendanceId(attendanceId)
  }
}
