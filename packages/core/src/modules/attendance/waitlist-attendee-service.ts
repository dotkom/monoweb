import {
  type UserId,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  WaitlistAttendeeWriteSchema,
} from "@dotkomonline/types"
import type { z } from "zod"
import type { AttendancePoolRepository } from "./attendance-pool-repository"
import type { WaitlistAttendeRepository } from "./waitlist-attendee-repository"

export const CreateWaitlistSchema = WaitlistAttendeeWriteSchema.omit({
  attendancePoolId: true,
  position: true,
})

type CreateWaitlist = z.infer<typeof CreateWaitlistSchema>

export interface WaitlistAttendeService {
  create(obj: CreateWaitlist): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<void>
  getByUserId(userId: UserId, waitlistAttendeeId: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  getByAttendanceId(id: string): Promise<WaitlistAttendee[] | null>
}

export class WaitlistAttendeServiceImpl implements WaitlistAttendeService {
  constructor(
    private readonly waitlistAttendeeRepository: WaitlistAttendeRepository,
    private readonly attendancePoolRepository: AttendancePoolRepository
  ) {
    this.waitlistAttendeeRepository = waitlistAttendeeRepository
  }

  async create(obj: CreateWaitlist): Promise<WaitlistAttendee> {
    const pools = await this.attendancePoolRepository.getByAttendanceId(obj.attendanceId)

    const pool = pools.find((pool) => pool.yearCriteria.includes(obj.studyYear))

    if (!pool) {
      throw new Error("No pool found for the given study year")
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

  async getByUserId(userId: UserId, waitlistAttendeeId: WaitlistAttendeeId): Promise<WaitlistAttendee | null> {
    return this.waitlistAttendeeRepository.getByUserId(userId, waitlistAttendeeId)
  }

  async getByAttendanceId(id: string): Promise<WaitlistAttendee[]> {
    return this.waitlistAttendeeRepository.getByAttendanceId(id)
  }

  async getActiveByPoolId(poolId: string): Promise<WaitlistAttendee[]> {
    return this.waitlistAttendeeRepository.getByPoolId(poolId)
  }
}
