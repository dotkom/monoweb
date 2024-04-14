import type { Attendance, AttendanceId, AttendanceWrite, Extras, WaitlistAttendee } from "@dotkomonline/types"
import {
  AttendanceDeletionError,
  AttendanceNotFound,
  AttendanceValidationError,
  ExtrasUpdateAfterRegistrationStartError,
  InvalidParametersError,
} from "./attendance-error"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { AttendanceRepository } from "./attendance-repository"
import type { AttendeeRepository } from "./attendee-repository"
import type { WaitlistAttendeRepository } from "./waitlist-attendee-repository"

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]): Promise<void>
  updateExtras(id: AttendanceId, extras: Extras[], now?: Date): Promise<Attendance | null>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly attendeeRepository: AttendeeRepository,
    private readonly waitlistAttendeeRepository: WaitlistAttendeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository
  ) {}

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId) {
    const attendance = await this.attendanceRepository.update(obj, id)
    return attendance
  }

  async updateExtras(id: AttendanceId, extras: Extras[], now: Date = new Date()) {
    const attendance = await this.attendanceRepository.getById(id)

    if (!attendance) {
      throw new AttendanceNotFound(id)
    }

    if (attendance.registerStart < now) {
      throw new ExtrasUpdateAfterRegistrationStartError()
    }

    return this.attendanceRepository.update(
      {
        ...attendance,
        extras,
      },
      id
    )
  }

  /**
   * Creates a new attendance record.
   * Validates dates according to the following rules:
   * registerStart < registerEnd
   *
   */
  async create(obj: AttendanceWrite) {
    // registerStart < registerEnd
    if (obj.registerStart > obj.registerEnd) {
      throw new AttendanceValidationError("Register start must be before register end")
    }

    const attendance = await this.attendanceRepository.create(obj)

    return attendance
  }

  async delete(id: AttendanceId) {
    const attendees = await this.attendeeRepository.getByAttendanceId(id)

    if (attendees.length > 0) {
      throw new AttendanceDeletionError("Cannot delete attendance with attendees")
    }

    await this.attendanceRepository.delete(id)
  }

  async getById(id: AttendanceId) {
    return this.attendanceRepository.getById(id)
  }

  async getAllWaitlistAttendeesOrdered(attendanceId: AttendanceId): Promise<WaitlistAttendee[]> {
    const waitlistAttendeesUnordered = await this.waitlistAttendeeRepository.getByAttendanceId(attendanceId)
    return waitlistAttendeesUnordered.sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())
  }

  async merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]) {
    const attendance = await this.attendanceRepository.getById(attendanceId)
    if (attendance === null) {
      throw new AttendanceNotFound(attendanceId)
    }

    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)

    // Check that the year criteria of the merge pool contains all of the year criteria of the pools being merged
    const combinedCriteria = Array.from(new Set(pools.flatMap((pool) => pool.yearCriteria)))
    if (!combinedCriteria.every((criteria) => yearCriteria.includes(criteria))) {
      throw new InvalidParametersError(
        `Merge pool must contain the combined year criteria of the pools being merged: (${combinedCriteria.join(",")})`
      )
    }

    const combinedCapacity = pools.reduce((acc, pool) => acc + pool.capacity, 0)
    const mergePool = await this.attendancePoolRepository.create({
      attendanceId,
      capacity: combinedCapacity,
      yearCriteria: yearCriteria,
      title: mergePoolTitle,
      isVisible: true,
      type: "MERGE",
    })

    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const waitlistAttendees = await this.getAllWaitlistAttendeesOrdered(attendanceId)

    await Promise.all(
      attendees.map((attendee) => this.attendeeRepository.update({ attendancePoolId: mergePool.id }, attendee.id))
    )
    await Promise.all(
      waitlistAttendees.map((waitlistAttendee, i) =>
        this.waitlistAttendeeRepository.update({ attendancePoolId: mergePool.id, position: i }, waitlistAttendee.id)
      )
    )
    await Promise.all(pools.map((pool) => this.attendancePoolRepository.delete(pool.id)))
  }
}
