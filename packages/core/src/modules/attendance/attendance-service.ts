import type { Attendance, AttendanceId, AttendanceWrite, Extras } from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
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

  async merge(attendanceId: AttendanceId, mergePoolTitle: string, yearCriteria: number[]) {
    const attendance = await this.attendanceRepository.getById(attendanceId)
    if (attendance === null) {
      throw new AttendanceNotFound(attendanceId)
    }

    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)

    // Create a merge pool with combined capacities and rules
    const combinedCapacity = pools.reduce((acc, pool) => acc + pool.capacity, 0)
    const combinedCriteria = Array.from(new Set(pools.flatMap((pool) => pool.yearCriteria)))

    // check that yearCriteria contains all of the combined year criteria
    if (!combinedCriteria.every((criteria) => yearCriteria.includes(criteria))) {
      throw new InvalidParametersError(
        `Merge pool must contain the combined year criteria of the pools being merged (${combinedCriteria.join(",")})`
      )
    }

    const insert = await this.attendancePoolRepository.create({
      attendanceId,
      capacity: combinedCapacity,
      yearCriteria: yearCriteria,
      title: mergePoolTitle,
      isVisible: true,
      type: "MERGE",
    })

    // Get the number of attendees in the new pool
    const mergePool = await this.attendancePoolRepository.get(insert.id)

    if (mergePool === null) {
      throw new IllegalStateError("Pool not found after insert")
    }

    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const updatedAttendees = attendees.map((attendee) =>
      this.attendeeRepository.update({ attendancePoolId: mergePool.id }, attendee.id)
    )

    console.log(`Moved ${attendees.length} attendees to pool ${mergePool.id}`)

    // move all waitlist attendees to the new pool, sort by position value
    const waitlistAttendees = await this.waitlistAttendeeRepository.getByAttendanceId(attendanceId)

    const combinedWaitlistAttendees = waitlistAttendees.sort((a, b) => a.registeredAt.getDate() - b.registeredAt.getDate())

    const updatedWaitlistAttendees = combinedWaitlistAttendees.map((waitlistAttendee, i) =>
      this.waitlistAttendeeRepository.update(waitlistAttendee.id, { attendancePoolId: mergePool.id, position: i })
    )

    const poolsToDelete = pools.map((pool) => this.attendancePoolRepository.delete(pool.id))

    const res = await Promise.all(updatedAttendees)
    const res2 = await Promise.all(poolsToDelete)
    const res3 = await Promise.all(updatedWaitlistAttendees)

    console.log("Deleted pools", res2)
    console.log("Updated attendees", res)
    console.log("Updated waitlist attendees", res3)
  }
}
