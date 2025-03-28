import type { UserId, WaitlistAttendee, WaitlistAttendeeId, WaitlistAttendeeWrite } from "@dotkomonline/types"
import { AttendanceNotFound } from "./attendance-error"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { WaitlistAttendeeRepository } from "./waitlist-attendee-repository"

export interface WaitlistAttendeService {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
  getByUserId(userId: UserId): Promise<WaitlistAttendee[] | null>
  getByAttendanceId(id: string): Promise<WaitlistAttendee[] | null>
}

export class WaitlistAttendeServiceImpl implements WaitlistAttendeService {
  private readonly waitlistAttendeeRepository: WaitlistAttendeeRepository
  private readonly attendanceRepository: AttendanceRepository

  constructor(
    waitlistAttendeeRepository: WaitlistAttendeeRepository,
    attendanceRepository: AttendanceRepository
  ) {
    this.waitlistAttendeeRepository = waitlistAttendeeRepository
    this.attendanceRepository = attendanceRepository
  }

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    const attendance = await this.attendanceRepository.getById(obj.attendanceId)

    if (attendance === null) {
      throw new AttendanceNotFound(obj.attendanceId)
    }

    const pool = attendance.pools.find((pool) => pool.yearCriteria.includes(obj.studyYear))

    if (!pool) {
      throw new AttendancePoolNotFoundError(obj.attendanceId)
    }

    const activeWaitlistAttendees = await this.waitlistAttendeeRepository.getByPoolId(pool.id)

    const position = activeWaitlistAttendees.length

    return this.waitlistAttendeeRepository.create({
      ...obj,
      position,
      attendancePoolId: pool.id,
    })
  }

  async delete(id: WaitlistAttendeeId): Promise<void> {
    await this.waitlistAttendeeRepository.delete(id)
  }

  async getByUserId(userId: UserId): Promise<WaitlistAttendee[] | null> {
    return this.waitlistAttendeeRepository.getByUserId(userId)
  }

  async getByAttendanceId(id: string): Promise<WaitlistAttendee[]> {
    return this.waitlistAttendeeRepository.getByAttendanceId(id)
  }

  async getActiveByPoolId(poolId: string): Promise<WaitlistAttendee[]> {
    return this.waitlistAttendeeRepository.getByPoolId(poolId)
  }
}
