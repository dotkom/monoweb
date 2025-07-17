import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendanceSelectionResponse,
  type Attendee,
  type AttendeeId,
  type AttendeeWithoutUser,
  type User,
  type UserId,
  canDeregisterForAttendance as attendanceOpenForDeregistration,
  canRegisterForAttendance as attendanceOpenForRegistration,
  canUserAttendPool,
  getMembershipGrade,
} from "@dotkomonline/types"
import { addHours, isFuture } from "date-fns"
import { tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { UserService } from "../user/user-service"
import { AttendanceDeregisterClosedError, AttendanceNotFound, AttendanceNotOpenError } from "./attendance-error"
import { AttendancePoolNotFoundError, WrongAttendancePoolError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import { AttendeeDeregistrationError, AttendeeNotFoundError, AttendeeRegistrationError } from "./attendee-error"
import type { AttendeeRepository } from "./attendee-repository"

type AdminDeregisterForEventOptions = { reserveNextAttendee: boolean; bypassCriteriaOnReserveNextAttendee: boolean }

export interface AttendeeService {
  getByUserId(handle: DBHandle, userId: UserId, attendanceId: AttendanceId): Promise<Attendee>
  registerForEvent(handle: DBHandle, userId: string, attendanceId: string, attendancePoolId: string): Promise<Attendee>
  adminRegisterForEvent(
    handle: DBHandle,
    userId: string,
    attendanceId: string,
    attendancePoolId: string
  ): Promise<Attendee>
  deregisterForEvent(handle: DBHandle, userId: string, attendanceId: string): Promise<void>
  adminDeregisterForEvent(
    handle: DBHandle,
    attendeeId: AttendeeId,
    options: AdminDeregisterForEventOptions
  ): Promise<void>
  delete(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  updateSelectionResponses(
    handle: DBHandle,
    id: AttendeeId,
    responses: AttendanceSelectionResponse[]
  ): Promise<Attendee>
  getByAttendanceId(handle: DBHandle, attendanceId: string): Promise<Attendee[]>
  getByAttendancePoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendee[]>
  updateAttended(handle: DBHandle, attendeeId: AttendeeId, attended: boolean): Promise<Attendee>
  /**
   * Attempts to reserve the attendee if the following criteria are met:
   * - The reserve time is now or in the past
   * - The pool is not at full capacity
   *
   * If bypassCriteria is true, then the criteria will be ignored.
   */
  attemptReserve(
    handle: DBHandle,
    attendee: Attendee,
    pool: AttendancePool,
    options: { bypassCriteria: boolean }
  ): Promise<boolean>
  getAttendeeStatuses(
    handle: DBHandle,
    userId: UserId,
    attendanceIds: AttendanceId[]
  ): Promise<Map<AttendanceId, "RESERVED" | "UNRESERVED">>
  removeSelectionResponses(handle: DBHandle, selectionId: string): Promise<AttendanceId | null>
}

export function getAttendeeService(
  attendeeRepository: AttendeeRepository,
  attendanceRepository: AttendanceRepository,
  userService: UserService,
  taskSchedulingService: TaskSchedulingService
): AttendeeService {
  async function addUserToAttendee(
    handle: DBHandle,
    attendeeWithoutUser: AttendeeWithoutUser,
    user?: User
  ): Promise<Attendee> {
    const resolvedUser = user ?? (await userService.getById(handle, attendeeWithoutUser.userId))
    return { ...attendeeWithoutUser, user: resolvedUser }
  }
  return {
    async getByUserId(handle: DBHandle, userId: UserId, attendanceId: AttendanceId) {
      const attendeeWithoutUser = await attendeeRepository.getByUserId(handle, userId, attendanceId)
      if (!attendeeWithoutUser) {
        throw new AttendeeNotFoundError(userId, attendanceId)
      }
      return await addUserToAttendee(handle, attendeeWithoutUser)
    },
    async registerForEvent(handle: DBHandle, userId: string, attendanceId: string, attendancePoolId: string) {
      const registerTime = new Date()
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }

      const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)
      if (!attendancePool) {
        throw new AttendancePoolNotFoundError(attendancePoolId)
      }

      if (!attendanceOpenForRegistration(attendance, registerTime)) {
        throw new AttendanceNotOpenError()
      }

      const user = await userService.getById(handle, userId)
      if (!canUserAttendPool(attendancePool, user)) {
        throw new AttendeeRegistrationError(`User ${user.id} does not qualify for pool ${attendancePool.id}`)
      }

      const isMergePool = attendancePool.capacity === 0

      const markDelayHours = 0 // TODO
      const mergePoolDelayHours = (isMergePool && attendancePool.mergeDelayHours) || 0

      const reserveDelayHours = markDelayHours + mergePoolDelayHours
      const reserveTime = addHours(registerTime, reserveDelayHours)

      const userGrade = getMembershipGrade(user.membership)

      const attendeeWithoutUser = await attendeeRepository.create(handle, {
        userId,
        attendancePoolId,
        attendanceId,
        userGrade,
        reserveTime,
        reserved: false,
      })
      const attendee = await addUserToAttendee(handle, attendeeWithoutUser, user)
      if (attendancePool.id !== attendeeWithoutUser.attendancePoolId) {
        throw new WrongAttendancePoolError(attendeeWithoutUser.attendancePoolId, attendancePool.id)
      }
      if (!isFuture(reserveTime)) {
        attendee.reserved = await this.attemptReserve(handle, attendee, attendancePool, { bypassCriteria: false })
      } else {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.ATTEMPT_RESERVE_ATTENDEE.kind,
          { userId, attendanceId },
          new TZDate(reserveTime)
        )
      }
      return await addUserToAttendee(handle, attendeeWithoutUser, user)
    },
    async adminRegisterForEvent(handle: DBHandle, userId: string, attendanceId: string, attendancePoolId: string) {
      const registerTime = new Date()
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }

      const attendancePool = attendance.pools.find((pool) => pool.id === attendancePoolId)
      if (!attendancePool) {
        throw new AttendancePoolNotFoundError(attendancePoolId)
      }

      const user = await userService.getById(handle, userId)
      const userGrade = getMembershipGrade(user.membership)

      const attendeeWithoutUser = await attendeeRepository.create(handle, {
        userId,
        attendancePoolId,
        attendanceId: attendancePool.attendanceId,
        userGrade,
        reserveTime: registerTime,
        reserved: true,
      })

      return addUserToAttendee(handle, attendeeWithoutUser, user)
    },
    async deregisterForEvent(handle: DBHandle, userId: string, attendanceId: string) {
      const deregisterTime = new Date()
      const attendance = await attendanceRepository.getById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }

      if (!attendanceOpenForDeregistration(attendance, deregisterTime)) {
        throw new AttendanceDeregisterClosedError()
      }

      const attendee = await attendeeRepository.getByUserId(handle, userId, attendanceId)
      if (!attendee) {
        throw new AttendeeDeregistrationError(
          `Tried to deregister attendee with user id '${userId}' in attendance with id '${attendanceId}' but attendee is not registered.`
        )
      }

      await attendeeRepository.delete(handle, attendee.id)
      const attendedPool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      if (attendedPool) {
        const nextUnreservedAttendeeWithoutUser = await attendeeRepository.getFirstUnreservedByAttendancePoolId(
          handle,
          attendedPool.id
        )

        if (!nextUnreservedAttendeeWithoutUser) {
          return
        }
        const nextUnreservedAttendee = await addUserToAttendee(handle, nextUnreservedAttendeeWithoutUser)

        await this.attemptReserve(handle, nextUnreservedAttendee, attendedPool, { bypassCriteria: false })
      }
    },
    async delete(handle: DBHandle, attendeeId: AttendeeId) {
      await attendeeRepository.delete(handle, attendeeId)
    },
    async updateSelectionResponses(handle: DBHandle, id: AttendeeId, responses: AttendanceSelectionResponse[]) {
      const attendeeWithoutUser = await attendeeRepository.update(handle, id, { selections: responses })
      return await addUserToAttendee(handle, attendeeWithoutUser)
    },
    async getByAttendanceId(handle: DBHandle, attendanceId: string) {
      const attendeesWithoutUsers = await attendeeRepository.getByAttendanceId(handle, attendanceId)
      return await Promise.all(attendeesWithoutUsers.map((attendee) => addUserToAttendee(handle, attendee)))
    },
    async getByAttendancePoolId(handle: DBHandle, attendancePoolId: AttendancePoolId) {
      const attendeesWithoutUsers = await attendeeRepository.getByAttendancePoolId(handle, attendancePoolId)
      return await Promise.all(attendeesWithoutUsers.map((attendee) => addUserToAttendee(handle, attendee)))
    },
    async updateAttended(handle: DBHandle, attendeeId: AttendeeId, attended: boolean) {
      const attendeeWithoutUser = await attendeeRepository.update(handle, attendeeId, { attended })
      return await addUserToAttendee(handle, attendeeWithoutUser)
    },
    async attemptReserve(
      handle: DBHandle,
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
        return await attendeeRepository.reserveAttendee(handle, attendee.id)
      }

      return false
    },
    async getAttendeeStatuses(handle: DBHandle, userId: UserId, attendanceIds: AttendanceId[]) {
      return await attendeeRepository.getAttendeeStatuses(handle, userId, attendanceIds)
    },
    async removeSelectionResponses(handle: DBHandle, selectionId: string) {
      return await attendeeRepository.removeSelectionResponses(handle, selectionId)
    },
    async adminDeregisterForEvent(
      handle: DBHandle,
      attendeeId: AttendeeId,
      { reserveNextAttendee, bypassCriteriaOnReserveNextAttendee }: AdminDeregisterForEventOptions
    ) {
      const pool = await attendanceRepository.getPoolByAttendeeId(handle, attendeeId)
      if (!pool) {
        throw new AttendancePoolNotFoundError(`${attendeeId} (attendee id)`)
      }

      await attendeeRepository.delete(handle, attendeeId)
      if (reserveNextAttendee) {
        const nextUnreservedAttendeeWithoutUser = await attendeeRepository.getFirstUnreservedByAttendancePoolId(
          handle,
          pool.id
        )

        if (!nextUnreservedAttendeeWithoutUser) {
          return
        }
        const nextUnreservedAttendee = await addUserToAttendee(handle, nextUnreservedAttendeeWithoutUser)
        await this.attemptReserve(handle, nextUnreservedAttendee, pool, {
          bypassCriteria: bypassCriteriaOnReserveNextAttendee,
        })
      }
    },
  }
}
