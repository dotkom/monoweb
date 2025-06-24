import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendanceSelectionResponse,
  type Attendee,
  type AttendeeId,
  type AttendeeSelectionId,
  type AttendeeSelectionResponse,
  type AttendeeWithoutUser,
  type AttendeeWrite,
  type User,
  type UserId,
  canDeregisterForAttendance as attendanceOpenForDeregistration,
  canRegisterForAttendance as attendanceOpenForRegistration,
  canUserAttendPool,
  getMembershipGrade,
} from "@dotkomonline/types"
import { addHours, isFuture } from "date-fns"
import type { JobService } from "../job/job-service"
import type { UserService } from "../user/user-service"
import { AttendanceDeregisterClosedError, AttendanceNotOpenError } from "./attendance-error"
import { AttendancePoolNotFoundError, WrongAttendancePoolError } from "./attendance-pool-error"
import type { AttendanceService } from "./attendance-service"
import { AttendeeNotFoundError, AttendeeRegistrationError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"

type AdminDeregisterForEventOptions = { reserveNextAttendee: boolean; bypassCriteriaOnReserveNextAttendee: boolean }

export interface AttendeeService {
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee>
  registerForEvent(userId: UserId, attendanceId: AttendanceId, attendancePoolId: AttendancePoolId): Promise<Attendee>
  adminRegisterForEvent(
    userId: UserId,
    attendanceId: AttendanceId,
    attendancePoolId: AttendancePoolId
  ): Promise<Attendee>
  deregisterForEvent(userId: UserId, attendanceId: AttendanceId): Promise<void>
  adminDeregisterForEvent(attendeeId: AttendeeId, options: AdminDeregisterForEventOptions): Promise<void>
  delete(attendeeId: AttendeeId): Promise<void>
  updateSelectionResponses(attendeeId: AttendeeId, responses: AttendanceSelectionResponse[]): Promise<Attendee>
  getByAttendanceId(attendanceId: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(attendancePoolId: AttendancePoolId): Promise<Attendee[]>
  updateAttended(attendeeId: AttendeeId, attended: boolean): Promise<Attendee>
  /**
   * Attempts to reserve the attendee if the following criteria are met:
   * - The reserve time is now or in the past
   * - The pool is not at full capacity
   *
   * If bypassCriteria is true, then the criteria will be ignored.
   */
  attemptReserve(attendee: Attendee, pool: AttendancePool, options: { bypassCriteria: boolean }): Promise<boolean>
  getAttendeeSelectionsByAttendanceId(attendanceId: AttendanceId): Promise<AttendeeSelectionResponse>
  removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: AttendeeSelectionId): Promise<void>
  attendanceHasAttendees(attendanceId: AttendanceId): Promise<boolean>
  attendancePoolHasAttendees(attendancePoolId: AttendancePoolId): Promise<boolean>
  moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId): Promise<void>
}

export class AttendeeServiceImpl implements AttendeeService {
  private readonly attendeeRepository: AttendeeRepository
  private readonly attendanceService: AttendanceService
  private readonly userService: UserService
  private readonly jobService: JobService

  constructor(
    attendeeRepository: AttendeeRepository,
    attendanceService: AttendanceService,
    userService: UserService,
    jobService: JobService
  ) {
    this.attendeeRepository = attendeeRepository
    this.attendanceService = attendanceService
    this.userService = userService
    this.jobService = jobService
  }

  private async addUserToAttendee(attendeeWithoutUser: AttendeeWithoutUser, user?: User): Promise<Attendee> {
    const resolvedUser = user ?? (await this.userService.getById(attendeeWithoutUser.userId))

    return { ...attendeeWithoutUser, user: resolvedUser }
  }

  private async create(data: AttendeeWrite, attendancePool: AttendancePool, user: User): Promise<Attendee> {
    const attendeeWithoutUser = await this.attendeeRepository.create(data)
    const attendee = await this.addUserToAttendee(attendeeWithoutUser, user)

    if (attendancePool.id !== data.attendancePoolId) {
      throw new WrongAttendancePoolError(data.attendancePoolId, attendancePool.id)
    }

    const { reserveTime, attendanceId, userId } = data

    if (!isFuture(reserveTime)) {
      attendee.reserved = await this.attemptReserve(attendee, attendancePool, { bypassCriteria: false })
    } else {
      await this.jobService.scheduleAttemptReserveAttendeeJob(reserveTime, { attendanceId, userId })
    }

    return attendee
  }

  /**
   * Helper function to attempt to reserve the next attendee in the pool.
   *
   * If bypassCriteria is true, the criteria for reserving the attendee will be ignored
   *
   * @see {@link attemptReserve}
   */
  private async attemptReserveNextAttendee(pool: AttendancePool, { bypassCriteria }: { bypassCriteria: boolean }) {
    const nextUnreservedAttendeeWithoutUser = await this.attendeeRepository.getFirstUnreservedByAttendancePoolId(
      pool.id
    )

    if (!nextUnreservedAttendeeWithoutUser) {
      return false
    }

    const nextUnreservedAttendee = await this.addUserToAttendee(nextUnreservedAttendeeWithoutUser)

    return await this.attemptReserve(nextUnreservedAttendee, pool, { bypassCriteria })
  }

  public async delete(attendeeId: AttendeeId) {
    await this.attendeeRepository.delete(attendeeId)
  }

  public async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const attendeeWithoutUser = await this.attendeeRepository.getByUserId(userId, attendanceId)

    if (!attendeeWithoutUser) {
      throw new AttendeeNotFoundError(userId, attendanceId)
    }

    return await this.addUserToAttendee(attendeeWithoutUser)
  }

  public async updateAttended(attendeeId: AttendeeId, attended: boolean) {
    const attendeeWithoutUser = await this.attendeeRepository.update(attendeeId, { attended })

    return await this.addUserToAttendee(attendeeWithoutUser)
  }

  public async updateSelectionResponses(attendeeId: AttendeeId, responses: AttendanceSelectionResponse[]) {
    const attendeeWithoutUser = await this.attendeeRepository.update(attendeeId, { selections: responses })

    return await this.addUserToAttendee(attendeeWithoutUser)
  }

  public async adminRegisterForEvent(userId: UserId, attendanceId: AttendanceId, attendancePoolId: AttendancePoolId) {
    const registerTime = new Date()

    const attendance = await this.attendanceService.getById(attendanceId)
    const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)

    if (!attendancePool) {
      throw new AttendancePoolNotFoundError(attendancePoolId)
    }

    const user = await this.userService.getById(userId)
    const userGrade = getMembershipGrade(user.membership)

    const attendeeWithoutUser = await this.attendeeRepository.create({
      userId,
      attendancePoolId,
      attendanceId: attendancePool.attendanceId,
      userGrade,
      reserveTime: registerTime,
      reserved: true,
    })

    return this.addUserToAttendee(attendeeWithoutUser, user)
  }

  public async adminDeregisterForEvent(
    attendeeId: AttendeeId,
    { reserveNextAttendee, bypassCriteriaOnReserveNextAttendee }: AdminDeregisterForEventOptions
  ) {
    const attendeeWithoutUser = await this.attendeeRepository.delete(attendeeId)

    if (!reserveNextAttendee) {
      return
    }

    const attendedPool = await this.attendanceService.getPoolById(attendeeWithoutUser.attendancePoolId)

    await this.attemptReserveNextAttendee(attendedPool, { bypassCriteria: bypassCriteriaOnReserveNextAttendee })
  }

  public async registerForEvent(userId: UserId, attendanceId: AttendanceId, attendancePoolId: AttendancePoolId) {
    const registerTime = new Date()

    const attendance = await this.attendanceService.getById(attendanceId)
    const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)

    if (!attendancePool) {
      throw new AttendancePoolNotFoundError(attendancePoolId)
    }

    if (!attendanceOpenForRegistration(attendance, registerTime)) {
      throw new AttendanceNotOpenError()
    }

    const user = await this.userService.getById(userId)

    if (!canUserAttendPool(attendancePool, user)) {
      throw new AttendeeRegistrationError(`User ${user.id} does not qualify for pool ${attendancePool.id}`)
    }

    const isMergePool = attendancePool.capacity === 0

    const markDelayHours = 0 // TODO
    const mergePoolDelayHours = (isMergePool && attendancePool.mergeDelayHours) || 0

    const reserveDelayHours = markDelayHours + mergePoolDelayHours
    const reserveTime = addHours(registerTime, reserveDelayHours)

    const userGrade = getMembershipGrade(user.membership)

    const attendeeWithoutUser = await this.create(
      {
        userId,
        attendancePoolId,
        attendanceId,
        userGrade,
        reserveTime,
        reserved: false,
      },
      attendancePool,
      user
    )

    return await this.addUserToAttendee(attendeeWithoutUser, user)
  }

  public async attemptReserve(
    attendee: Attendee,
    pool: AttendancePool,
    { bypassCriteria }: { bypassCriteria: boolean }
  ) {
    if (attendee.reserved) {
      return true
    }

    const isPastReserveTime = !isFuture(attendee.reserveTime)
    const poolHasCapacity = pool.numAttendees < pool.capacity

    if ((isPastReserveTime && poolHasCapacity) || bypassCriteria) {
      return await this.attendeeRepository.reserveAttendee(attendee.id)
    }

    return false
  }

  public async deregisterForEvent(userId: UserId, attendanceId: AttendanceId) {
    const attendance = await this.attendanceService.getById(attendanceId)

    if (!attendanceOpenForDeregistration(attendance)) {
      throw new AttendanceDeregisterClosedError()
    }

    const attendeeWithoutUser = await this.attendeeRepository.deleteUserAttendance(userId, attendanceId)
    const attendedPool = attendance.pools.find((pool) => pool.id === attendeeWithoutUser.attendancePoolId)

    if (attendedPool) {
      await this.attemptReserveNextAttendee(attendedPool, { bypassCriteria: false })
    }
  }

  public async getByAttendanceId(attendanceId: AttendanceId) {
    const attendeesWithoutUsers = await this.attendeeRepository.getByAttendanceId(attendanceId)

    const attendees = await Promise.all(attendeesWithoutUsers.map((attendee) => this.addUserToAttendee(attendee)))

    return attendees
  }

  public async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendeesWithoutUsers = await this.attendeeRepository.getByAttendancePoolId(attendancePoolId)

    const attendees = await Promise.all(attendeesWithoutUsers.map((attendee) => this.addUserToAttendee(attendee)))

    return attendees
  }

  public async getAttendeeSelectionsByAttendanceId(attendanceId: AttendanceId) {
    return await this.attendeeRepository.getAttendeeSelectionsByAttendanceId(attendanceId)
  }

  public async removeAllSelectionResponsesForSelection(
    attendanceId: AttendanceId,
    selectionId: AttendeeSelectionId
  ): Promise<void> {
    await this.attendeeRepository.removeAllSelectionResponsesForSelection(attendanceId, selectionId)
  }

  public async attendanceHasAttendees(attendanceId: AttendanceId): Promise<boolean> {
    return await this.attendeeRepository.attendanceHasAttendees(attendanceId)
  }

  public async attendancePoolHasAttendees(attendancePoolId: AttendancePoolId): Promise<boolean> {
    return await this.attendeeRepository.attendancePoolHasAttendees(attendancePoolId)
  }

  public async moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId): Promise<void> {
    await this.attendeeRepository.moveFromMultiplePoolsToPool(fromPoolIds, toPoolId)
  }
}
