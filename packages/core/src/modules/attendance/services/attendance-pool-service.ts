import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type EventId,
} from "@dotkomonline/types"
import { AttendanceRepository } from "../repositories"

export interface _AttendancePoolService {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  getByAttendanceId(id: string): Promise<AttendancePool[]>
}

export class _PoolServiceImpl implements _AttendancePoolService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendanceRepository.pool.getByAttendanceId(id)
  }

  async create(obj: AttendancePoolWrite) {
    const res = await this.attendanceRepository.pool.create(obj)
    return res
  }

  async delete(id: AttendancePoolId) {
    await this.attendanceRepository.pool.delete(id)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const res = await this.attendanceRepository.pool.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const pool = await this.attendanceRepository.pool.get(id)
      if (pool === null) {
        throw new Error("Pool not found")
      }
      return pool
    }
    throw new Error("Failed to update pool")
  }

  async getPoolsByAttendanceId(attendanceId: string) {
    return this.attendanceRepository.pool.getByAttendanceId(attendanceId) ?? null
  }
}
