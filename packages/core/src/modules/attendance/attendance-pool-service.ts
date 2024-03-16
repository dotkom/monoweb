import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
} from "@dotkomonline/types"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendeeService } from "./attendee-service"

export interface AttendancePoolService {
  create(write: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  getByAttendanceId(id: string): Promise<AttendancePool[]>
}

export class AttendancePoolServiceImpl implements AttendancePoolService {
  constructor(private readonly attendancePoolRepository: AttendancePoolRepository, private readonly attendeeService: AttendeeService) {
    this.attendancePoolRepository = attendancePoolRepository
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendancePoolRepository.getByAttendanceId(id)
  }

  async create(write: AttendancePoolWrite) {
    const pools = await this.attendancePoolRepository.getByAttendanceId(write.attendanceId)

    const existingYearCriteria = pools.flatMap((pool) => pool.yearCriteria)

    const overlap = write.yearCriteria.some((year) => existingYearCriteria.includes(year))

    if (overlap) {
      throw new Error("Year criteria overlap")
    }

    const res = await this.attendancePoolRepository.create(write)
    return res
  }

  async delete(id: AttendancePoolId) {
    const attendees = await this.attendeeService.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new Error("Cannot delete attendance pool with attendees")
    }

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
