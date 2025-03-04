import type { UserId, WaitlistAttendee, WaitlistAttendeeId, WaitlistAttendeeWrite } from "@dotkomonline/types"
import { AttendancePoolNotFoundError } from "./attendance-pool-error"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { WaitlistAttendeRepository } from "./waitlist-attendee-repository"

export interface WaitlistAttendeService {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
  getByUserId(userId: UserId): Promise<WaitlistAttendee[] | null>
  getByAttendanceId(id: string): Promise<WaitlistAttendee[] | null>
}

export class WaitlistAttendeServiceImpl implements WaitlistAttendeService {
  private readonly waitlistAttendeeRepository: WaitlistAttendeRepository
  private readonly attendancePoolRepository: AttendancePoolRepository

  constructor(
    waitlistAttendeeRepository: WaitlistAttendeRepository,
    attendancePoolRepository: AttendancePoolRepository
  ) {
    this.waitlistAttendeeRepository = waitlistAttendeeRepository
    this.attendancePoolRepository = attendancePoolRepository
  }

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    const pools = await this.attendancePoolRepository.getByAttendanceId(obj.attendanceId)

    const pool = pools.find((pool) => pool.yearCriteria.includes(obj.studyYear))

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
