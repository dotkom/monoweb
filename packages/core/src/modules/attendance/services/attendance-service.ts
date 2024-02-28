import {
  type Attendance,
  type AttendanceId,
  type AttendanceWrite,
  type Attendee,
  type EventId,
  type UserId,
} from "@dotkomonline/types"
import { AttendanceRepository } from "../repositories"

export interface _AttendanceService {
  create(obj: Partial<AttendanceWrite>, eventId: EventId): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  getByEventId(id: EventId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  isAttending(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class _AttendanceServiceImpl implements _AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {
    this.attendanceRepository = attendanceRepository
  }

  async isAttending(userId: UserId, attendanceId: EventId) {
    const attendee = await this.attendanceRepository.attendee.getByUserId(userId, attendanceId)

    if (attendee === undefined) {
      return null
    }

    return attendee
  }

  async update(obj: AttendanceWrite, id: AttendanceId) {
    const res = await this.attendanceRepository.attendance.update(obj, id)
    if (res.numUpdatedRows === 1) {
      const attendance = await this.attendanceRepository.attendance.getById(id)
      if (attendance === undefined) {
        throw new Error("Attendance not found")
      }
      return attendance
    }
    throw new Error("Failed to update attendance")
  }

  async create(obj: Partial<AttendanceWrite>, id: EventId) {
    return this.attendanceRepository.attendance.create({
      eventId: id,
      ...obj,
    })
  }

  async delete(id: AttendanceId) {
    await this.attendanceRepository.attendance.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.attendance.getById(id)
  }

  async getByEventId(id: EventId) {
    const result = await this.attendanceRepository.attendance.getByEventId(id)
    if (result === undefined) {
      return null
    }

    return result
  }
}
