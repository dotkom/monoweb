import {
  type Attendance,
  type AttendanceId,
  type AttendanceWrite,
  type Attendee,
  type EventId,
  type UserId,
} from "@dotkomonline/types"
import { AttendeeRepository } from "./attendee-repository"
import { AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  isAttending(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendeeRepository: AttendeeRepository
  ) {
    this.attendanceRepository = attendanceRepository
  }

  async isAttending(userId: UserId, attendanceId: EventId) {
    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)

    if (attendee === undefined) {
      return null
    }

    return attendee
  }

  async update(obj: AttendanceWrite, id: AttendanceId) {
    const res = await this.attendanceRepository.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const attendance = await this.attendanceRepository.getById(id)
      if (attendance === undefined) {
        throw new Error("Attendance not found")
      }
      return attendance
    }
    throw new Error("Failed to update attendance")
  }

  async create(obj: AttendanceWrite) {
    return this.attendanceRepository.create(obj)
  }

  async delete(id: AttendanceId) {
    await this.attendanceRepository.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }
}
