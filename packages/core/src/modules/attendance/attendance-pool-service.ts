import type {
  AttendanceId,
  AttendancePool,
  AttendancePoolBase,
  AttendancePoolId,
  AttendancePoolWrite,
} from "@dotkomonline/types"
import { CantDeletePoolError } from "./attendance-pool-error"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { AttendeeService } from "./attendee-service"

export interface AttendancePoolService {
  create(write: AttendancePoolWrite): Promise<AttendancePoolBase>
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
