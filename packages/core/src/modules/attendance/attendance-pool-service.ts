import {
  AttendancePoolBase,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
} from "@dotkomonline/types"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendeeService } from "./attendee-service"
import { AttendancePoolValidationError, CantDeletePoolError } from "./attendance-pool-error"

export interface AttendancePoolService {
  create(write: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<void>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePoolBase | null>
  getByAttendanceId(id: string): Promise<AttendancePool[]>
}

export class AttendancePoolServiceImpl implements AttendancePoolService {
  constructor(
    private readonly attendancePoolRepository: AttendancePoolRepository,
    private readonly attendeeService: AttendeeService
  ) {
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
      throw new AttendancePoolValidationError("Year criteria overlap")
    }

    const res = await this.attendancePoolRepository.create(write)
    return res
  }

  async delete(id: AttendancePoolId) {
    const attendees = await this.attendeeService.getByAttendancePoolId(id)

    if (attendees.length > 0) {
      throw new CantDeletePoolError("Pools with attendees cannot be deleted. Deregister attendees first.")
    }

    await this.attendancePoolRepository.delete(id)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    return this.attendancePoolRepository.update(obj, id)
  }

  async getPoolsByAttendanceId(attendanceId: string) {
    return this.attendancePoolRepository.getByAttendanceId(attendanceId) ?? null
  }
}
