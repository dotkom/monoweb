import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type EventId,
} from "@dotkomonline/types"
import { AttendancePoolRepository } from "./attendance-pool-repository"

export interface AttendancePoolService {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  getByAttendanceId(id: string): Promise<AttendancePool[]>
}

export class AttendancePoolServiceImpl implements AttendancePoolService {
  constructor(private readonly attendancePoolRepository: AttendancePoolRepository) {
    this.attendancePoolRepository = attendancePoolRepository
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendancePoolRepository.getByAttendanceId(id)
  }

  async create(obj: AttendancePoolWrite) {
    const res = await this.attendancePoolRepository.create(obj)
    return res
  }

  async delete(id: AttendancePoolId) {
    await this.attendancePoolRepository.delete(id)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const res = await this.attendancePoolRepository.update(obj, id)
    return res
  }

  async getPoolsByAttendanceId(attendanceId: string) {
    return this.attendancePoolRepository.getByAttendanceId(attendanceId) ?? null
  }
}
