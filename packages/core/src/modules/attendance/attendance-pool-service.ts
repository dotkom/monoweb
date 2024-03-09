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
    console.log("RUNNING")
    // 1. Check if there are gaps in obj.yearCriteria
    const hasGaps = (values: number[]): boolean => {
      const min = values.length ? Math.min(...values) : -1
      const max = values.length ? Math.max(...values) + 1 : -1

      if (min === max) {
        return true
      }

      const sorted = values.sort((a, b) => a - b)
      return !sorted.every((num, idx) => idx === 0 || num === sorted[idx - 1] + 1)
    }

    console.log(obj.yearCriteria)
    if (hasGaps(obj.yearCriteria)) {
      throw new Error("Year criteria is not continous")
    }

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
