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
import { WaitlistAttendeRepository } from "./waitlist-attendee-repository"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendanceValidationError, CantDeleteAttendanceError } from "./attendance-error"
import { NotImplementedError } from "../../error"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  merge(id: AttendanceId): Promise<void>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly waitlistAttendeeRepository: WaitlistAttendeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository
  ) {
    this.attendanceRepository = attendanceRepository
  }

  async update(obj: AttendanceWrite, id: AttendanceId) {
    const attendance = await this.attendanceRepository.update(obj, id)
    return attendance
  }

  /**
   * Creates a new attendance record.
   * Validates dates according to the following rules:
   * registerStart < mergeTime < registerEnd
   *
   */
  async create(obj: AttendanceWrite) {
    // registerStart < mergeTime
    if (obj.registerStart > obj.mergeTime) {
      throw new AttendanceValidationError("Register start must be before merge time")
    }

    // registerStart < registerEnd
    if (obj.registerStart > obj.registerEnd) {
      throw new AttendanceValidationError("Register start must be before register end")
    }

    // mergeTime < registerEnd
    if (obj.mergeTime > obj.registerEnd) {
      throw new AttendanceValidationError("Merge time must be before register end")
    }

    return this.attendanceRepository.create(obj)
  }

  async delete(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new CantDeleteAttendanceError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  async merge(id: AttendanceId) {
    // TODO: Implement this
    throw new NotImplementedError("Merge functionality is not yet implemented")
  }
}
