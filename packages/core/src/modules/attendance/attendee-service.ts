import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendanceSelectionResponse,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  type QrCodeRegistrationAttendee,
  type UserId,
  canDeregisterForAttendance as attendanceOpenForDeregistration,
  canRegisterForAttendance as attendanceOpenForRegistration,
  canUserAttendPool,
  getDisplayName,
  getMembershipGrade,
} from "@dotkomonline/types"
import { addHours } from "date-fns"
import { isFuture } from "date-fns"
import type { JobService } from "../job/job-service"
import { UserNotFoundError } from "../user/user-error"
import type { UserService } from "../user/user-service"
import { AttendanceDeregisterClosedError, AttendanceNotOpenError } from "./attendance-error"
import { AttendancePoolNotFoundError, AttendancePoolValidationError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError, AttendeeNotFoundError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"

export interface AttendeeService {
  registerForEvent(userId: string, attendanceId: string, attendancePoolId: string): Promise<Attendee>
  adminRegisterForEvent(userId: string, attendanceId: string, attendancePoolId: string): Promise<Attendee>
  deregisterForEvent(userId: string, attendanceId: string): Promise<void>
  adminDeregisterForEvent(id: AttendeeId, reserveNext: boolean): Promise<void>
  updateSelectionResponses(id: AttendanceId, responses: AttendanceSelectionResponse[]): Promise<Attendee>
  getByAttendanceId(attendanceId: string): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  updateAttended(id: AttendeeId, attended: boolean): Promise<Attendee>
  /**
   * Attempts to reserve the attendee if the following criteria are met:
   * - The reserve time is now or in the past
   * - The pool is not at full capacity
   *
   * If bypassCriteria is set to true, the criteria will be ignored and the attendee with be reserved regardless.
   *
   * @param attendee - The attendee to reserve.
   * @param pool - The pool to reserve the attendee in, used for capacity checks.
   * @param [bypassCriteria=false] - If true, the criteria for reserving the attendee will be ignored. Defaults to false.
   * @returns Returns the attendee if the reservation was successful, false otherwise.
   */
  attemptReserve(attendee: Attendee, pool: AttendancePool): Promise<Attendee | false>
  handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId): Promise<QrCodeRegistrationAttendee>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeServiceImpl implements AttendeeService {
  private readonly attendeeRepository: AttendeeRepository
  private readonly attendanceRepository: AttendanceRepository
  private readonly userService: UserService
  private readonly jobService: JobService

  constructor(
    attendeeRepository: AttendeeRepository,
    attendanceRepository: AttendanceRepository,
    userService: UserService,
    jobService: JobService
  ) {
    this.attendeeRepository = attendeeRepository
    this.attendanceRepository = attendanceRepository
    this.userService = userService
    this.jobService = jobService
  }

  private async create(obj: AttendeeWrite, attendancePool?: AttendancePool) {
    let attendee = await this.attendeeRepository.create(obj)

    const pool = attendancePool ?? (await this.attendanceRepository.getPoolById(obj.attendancePoolId))

    if (pool.id !== obj.attendancePoolId) {
      throw new AttendancePoolNotFoundError(
        `Expected attendance pool with id ${obj.attendancePoolId}, but found ${pool.id}`
      )
    }

    const { reserveTime, attendanceId } = obj
    const userId = obj.userId

    if (!isFuture(reserveTime)) {
      const newAttendee = await this.attemptReserve(attendee, pool)

      if (newAttendee) {
        attendee = newAttendee
      }
    } else {
      await this.jobService.scheduleAttemptReserveAttendeeJob(reserveTime, { attendanceId, userId })
    }

    return attendee
  }

  async delete(id: AttendeeId) {
    await this.attendeeRepository.delete(id)
  }

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    return await this.attendeeRepository.getByUserId(userId, attendanceId)
  }

  async updateAttended(id: AttendeeId, attended: boolean) {
    const attendee = await this.attendeeRepository.update(id, { attended })
    if (attendee === null) {
      throw new AttendeeNotFoundError(id)
    }
    return attendee
  }

  async handleQrCodeRegistration(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.userService.getById(userId)
    if (user === null) {
      throw new UserNotFoundError(userId)
    }
    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)
    if (attendee === null) {
      throw new AttendeeNotFoundError(`userid: ${userId}`, attendanceId)
    }
    if (attendee.attended === true) {
      return { attendee, user, alreadyAttended: true }
    }
    await this.attendeeRepository.update(attendee.id, { attended: true })

    return { attendee, user, alreadyAttended: false }
  }

  async updateSelectionResponses(id: AttendeeId, selections: AttendanceSelectionResponse[]) {
    const attendee = await this.attendeeRepository.update(id, { selections })

    if (attendee === null) {
      throw new AttendeeNotFoundError(id)
    }

    return attendee
  }

  async adminRegisterForEvent(userId: UserId, attendanceId: AttendancePoolId, attendancePoolId: AttendanceId) {
    const user = await this.userService.getById(userId)
    const attendance = await this.attendanceRepository.getById(attendanceId)
    const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)

    if (attendancePool === undefined) {
      throw new AttendancePoolNotFoundError("Tried to register to unknown attendance pool")
    }

    const registerTime = new Date()

    const displayName = getDisplayName(user)
    const userGrade = getMembershipGrade(user.membership)

    const attendee = await this.attendeeRepository.create({
      userId,
      attendancePoolId,
      attendanceId: attendancePool.attendanceId,
      displayName,
      userGrade,
      reserveTime: registerTime,
      reserved: true,
      userFlags: user.flags,
    })

    return attendee
  }

  /**
   * Helper function to attempt to reserve the next attendee in the pool.
   *
   * @param pool - The pool to reserve the attendee in.
   * @param bypassCriteria - If true, the criteria for reserving the attendee will be ignored. Defaults to false.
   * @returns Returns the attendee if the reservation was successful, false otherwise.
   * @see {@link attemptReserve}
   */
  private async attemptReserveNextAttendee(pool: AttendancePool, bypassCriteria: boolean) {
    const nextUnreservedAttendee = await this.attendeeRepository.getFirstUnreservedByAttendancePoolId(pool.id)

    if (nextUnreservedAttendee === null) {
      return false
    }

    return await this.attemptReserve(nextUnreservedAttendee, pool, bypassCriteria)
  }

  async adminDeregisterForEvent(id: AttendeeId, reserveNextAttendee: boolean) {
    const attendance = await this.attendanceRepository.getByAttendeeId(id)
    const pool = await this.attendanceRepository.getPoolByAttendeeId(id)

    if (attendance === null) {
      throw new AttendeeDeregistrationError("Attendance not found")
    }

    await this.attendeeRepository.delete(id)

    if (reserveNextAttendee) {
      await this.attemptReserveNextAttendee(pool, true)
    }
  }

  async registerForEvent(userId: UserId, attendanceId: AttendanceId, attendancePoolId: AttendancePoolId) {
    const user = await this.userService.getById(userId)
    const attendance = await this.attendanceRepository.getById(attendanceId)
    const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)

    if (attendancePool === undefined) {
      throw new AttendancePoolNotFoundError("Tried to register to unknown attendance pool")
    }

    const registerTime = new Date()

    if (!attendanceOpenForRegistration(attendance, registerTime)) {
      throw new AttendanceNotOpenError()
    }

    if (!canUserAttendPool(attendancePool, user)) {
      throw new AttendancePoolValidationError("User does not qualify for pool")
    }

    let reserveDelayHours = 0

    // TODO: Use mark service to get delay because of mark
    reserveDelayHours += 0

    // If the pool has a merge delay the reserve time is pushed
    const isMergePool = attendancePool.capacity === 0
    reserveDelayHours += (isMergePool && attendancePool.mergeDelayHours) || 0

    const reserveTime = addHours(registerTime, reserveDelayHours)

    const displayName = getDisplayName(user)
    const userGrade = getMembershipGrade(user.membership)

    return await this.create(
      {
        userId,
        attendancePoolId,
        attendanceId,
        displayName,
        userGrade,
        reserveTime,
        reserved: false,
        flags: user.flags,
      },
      attendancePool
    )
  }

  async attemptReserve(attendee: Attendee, pool: AttendancePool, bypassCriteria = false) {
    const attendeeIsPastReserveTime = attendee.reserveTime <= new Date()
    const poolHasCapacity = pool.numAttendees < pool.capacity

    if ((attendeeIsPastReserveTime && poolHasCapacity) || bypassCriteria) {
      return await this.attendeeRepository.reserveAttendee(attendee.id)
    }

    return false
  }

  async deregisterForEvent(userId: string, attendanceId: AttendanceId) {
    const deregisterTime = new Date()

    const attendance = await this.attendanceRepository.getById(attendanceId)

    if (!attendanceOpenForDeregistration(attendance, deregisterTime)) {
      throw new AttendanceDeregisterClosedError()
    }

    const attendee = await this.attendeeRepository.getByUserId(userId, attendanceId)

    if (attendee === null) {
      throw new AttendeeDeregistrationError(
        `Attendee with user id '${userId}' could not deregister in attendance with id '${attendanceId}' because attendee is not registered.`
      )
    }

    await this.attendeeRepository.delete(attendee.id)

    const attendedPool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)

    if (attendedPool) {
      await this.attemptReserveNextAttendee(attendedPool, false)
    }
  }

  async getByAttendanceId(id: AttendanceId) {
    return this.attendeeRepository.getByAttendanceId(id)
  }

  async getByAttendancePoolId(id: AttendancePoolId) {
    return await this.attendeeRepository.getByAttendancePoolId(id)
  }
}
