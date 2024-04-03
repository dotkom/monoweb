import {
  type Attendance,
  type AttendanceId,
  AttendancePool,
  type AttendanceWrite,
  Attendee,
  WaitlistAttendee
} from "@dotkomonline/types"
import { AttendanceValidationError, CantDeleteAttendanceError, InvalidParametersError } from "./attendance-error"
import { AttendancePoolRepository } from "./attendance-pool-repository"
import { AttendanceRepository } from "./attendance-repository"
import { AttendeeRepository } from "./attendee-repository"
import { WaitlistAttendeRepository } from "./waitlist-attendee-repository"
import { IllegalStateError } from "../../error"

type MergeReturn = {
  attendance: Attendance
  pool: AttendancePool
  waitlistAttendees: WaitlistAttendee[]
  attendees: Attendee[]
}

export interface AttendanceService {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<void>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance | null>
  merge(attendanceId: AttendanceId, mergePoolTitle: string, now: Date): Promise<MergeReturn>
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

  async merge(attendanceId: AttendanceId, mergePoolTitle: string, now: Date) {
    const attendance = await this.attendanceRepository.getById(attendanceId)
    if (attendance === null) {
      throw new InvalidParametersError("Attendance not found")
    }

    const pools = await this.attendancePoolRepository.getByAttendanceId(attendanceId)
    // Create a merge pool with combined capacities and rules

    const combinedCapacity = pools.reduce((acc, pool) => acc + pool.capacity, 0)
    const combinedCriteria = Array.from(new Set(pools.flatMap((pool) => pool.yearCriteria)))

    const insert = await this.attendancePoolRepository.create({
      attendanceId,
      capacity: combinedCapacity,
      yearCriteria: combinedCriteria,
      title: mergePoolTitle,
      activeFrom: now,
    })

    // Get the number of attendees in the new pool
    const mergePool = await this.attendancePoolRepository.get(insert.id)

    if(mergePool === null) {
      throw new IllegalStateError("Pool not found after insert")
    }

    // move all attendees to the new pool, sort by registration time
    const attendees = await this.attendeeRepository.getByAttendanceId(attendanceId)
    const combinedAttendees = attendees.sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())

    for (let i = 0; i < combinedAttendees.length; i++) {
      const attendee = combinedAttendees[i]
      await this.attendeeRepository.update({ attendancePoolId: mergePool.id }, attendee.id)
    }

    // move all waitlist attendees to the new pool, sort by position value
    const waitlistAttendees = await this.waitlistAttendeeRepository.getByAttendanceId(attendanceId)
    const combinedWaitlistAttendees = waitlistAttendees.sort((a, b) => a.position - b.position)

    for (let i = 0; i < combinedWaitlistAttendees.length; i++) {
      const waitlistAttendee = combinedWaitlistAttendees[i]

      await this.waitlistAttendeeRepository.update({
        attendanceId,
        position: i,
        attendancePoolId: mergePool.id,
        name: waitlistAttendee.name,
      }, waitlistAttendee.id)
    }

    return {
      attendance: attendance,
      pool: mergePool,
      attendees: combinedAttendees,
      waitlistAttendees: combinedWaitlistAttendees,
    }
  }
}
