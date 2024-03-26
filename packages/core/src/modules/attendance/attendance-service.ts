import {
  WaitlistAttendee,
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
import { IllegalStateError, NotImplementedError } from "../../error"

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

  async merge(id: AttendanceId): Promise<void> {
    const attendance = await this.attendanceRepository.getById(id)

    if (!attendance) {
      throw new IllegalStateError("Tried to merge a non-existent attendance")
    }

    // Create a merge pool with combined capacities and rules
    const pools = await this.attendancePoolRepository.getByAttendanceId(id)
    const combinedCapacity = pools.reduce((acc, pool) => acc + pool.limit, 0)
    const combinedYearCriteria = Array.from(new Set(pools.flatMap((pool) => pool.yearCriteria)))
    const mergePool = await this.attendancePoolRepository.create({
      attendanceId: id,
      limit: combinedCapacity,
      yearCriteria: combinedYearCriteria,
      title: "Påmelding",
    })

    const nonTargetWaitlistAttendeePenalty = attendance.mergeTime.getTime() - attendance.registerStart.getTime()
    const targetPools = pools.filter((pool) => pool.limit > 0)
    const targetStudyYears = targetPools.flatMap((pool) => pool.yearCriteria)

    const waitlistAttendees = await this.waitlistAttendeeRepository.getByAttendanceId(id)

    if (waitlistAttendees === null) {
      throw new IllegalStateError("Expected waitlist attendees to be non-null in merge")
    }

    const isTargetUser = (att: WaitlistAttendee) => targetStudyYears.includes(att.studyYear)

    const getEffectiveRegisterTime = (att: WaitlistAttendee) => {
      if (!isTargetUser(att)) return new Date(att.registeredAt.getTime() + nonTargetWaitlistAttendeePenalty)
      return att.registeredAt
    }

    const effectiveRegisterTimes = waitlistAttendees.map((att) => {
      return {
        att,
        effectiveRegisterTime: getEffectiveRegisterTime(att),
      }
    })

    const finalWaitlist = effectiveRegisterTimes
      .sort((a, b) => a.effectiveRegisterTime.getTime() - b.effectiveRegisterTime.getTime())
      .map((e) => e.att)

    for (let i = 0; i < finalWaitlist.length; i++) {
      const att = finalWaitlist[i]
      // update previous waitlist attendees to be inactive

      await this.waitlistAttendeeRepository.setInactive(att.id)

      const inserted = await this.waitlistAttendeeRepository.create({
        attendanceId: id,
        userId: att.userId,
        position: i,
        isPunished: att.isPunished,
        registeredAt: att.registeredAt,
        studyYear: att.studyYear,
        active: true,
        attendancePoolId: mergePool.id,
        name: att.name,
      })
    }

    // The following are the prioritizatoin for the ordering of the waiting list for the merge pool. Users within each gruop are ordered by the time they registered on the waiting list.

    // 1. Target users on the waiting list

    // 2. Marked target users

    // 3. Reserve users

    // 4. Reserve marked users
  }
}
