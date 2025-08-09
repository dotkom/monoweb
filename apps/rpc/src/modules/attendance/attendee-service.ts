import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import {
  type Attendance,
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
  getActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { addHours, addSeconds, isFuture } from "date-fns"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentService } from "../payment/payment-service"
import { type InferTaskData, type VerifyPaymentTaskDefinition, tasks } from "../task/task-definition"
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
  tryDeregisterForEvent(handle: DBHandle, userId: string, attendanceId: string): Promise<void>
  deregisterForEvent(handle: DBHandle, attendeeId: AttendeeId, options: AdminDeregisterForEventOptions): Promise<void>
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
    attendance: Attendance,
    options: { bypassCriteria: boolean; immediate?: boolean }
  ): Promise<boolean>
  reserve(handle: DBHandle, attendance: Attendance, attendee: Attendee, immediate: boolean): Promise<boolean>
  handleVerifyPaymentTask(handle: DBHandle, payload: InferTaskData<VerifyPaymentTaskDefinition>): Promise<void>
  handleOnPaymentTask(handle: DBHandle, paymentId: string): Promise<void>
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
  taskSchedulingService: TaskSchedulingService,
  personalMarkService: PersonalMarkService,
  paymentService: PaymentService
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
    async tryDeregisterForEvent(handle: DBHandle, userId: string, attendanceId: string) {
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

      if (attendee.paymentId) {
        await paymentService.cancelProductPayment(attendee.paymentId)
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

        await this.attemptReserve(handle, nextUnreservedAttendee, attendedPool, attendance, { bypassCriteria: false })
      }
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

      const markPunishment = await personalMarkService.getUserPunishment(handle, userId)

      if (markPunishment?.suspended) {
        throw new AttendeeRegistrationError(
          `User ${userId} is suspended and cannot register for attendance ${attendanceId}`
        )
      }

      const mergePoolDelayHours = (isMergePool && attendancePool.mergeDelayHours) || 0

      const reserveDelayHours = (markPunishment?.delay ?? 0) + mergePoolDelayHours
      const reserveTime = addHours(registerTime, reserveDelayHours)

      const activeMembership = getActiveMembership(user)
      const userGrade = activeMembership !== null ? getMembershipGrade(activeMembership) : null

      const attendeeWithoutUser = await attendeeRepository.create(handle, {
        userId,
        attendancePoolId,
        attendanceId,
        userGrade,
        earliestReservationAt: reserveTime,
        reserved: false,
        paymentLink: null,
        paymentDeadline: null,
        paidAt: null,
        paymentId: null,
      })
      const attendee = await addUserToAttendee(handle, attendeeWithoutUser, user)
      if (attendancePool.id !== attendeeWithoutUser.attendancePoolId) {
        throw new WrongAttendancePoolError(attendeeWithoutUser.attendancePoolId, attendancePool.id)
      }
      if (!isFuture(reserveTime)) {
        attendee.reserved = await this.attemptReserve(handle, attendee, attendancePool, attendance, {
          bypassCriteria: false,
          immediate: true,
        })
      } else {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.ATTEMPT_RESERVE_ATTENDEE.type,
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
      const activeMembership = getActiveMembership(user)
      const userGrade = activeMembership !== null ? getMembershipGrade(activeMembership) : null

      const attendeeWithoutUser = await attendeeRepository.create(handle, {
        userId,
        attendancePoolId,
        attendanceId: attendancePool.attendanceId,
        userGrade,
        earliestReservationAt: registerTime,
        reserved: true,
        paidAt: null,
        paymentDeadline: null,
        paymentLink: null,
        paymentId: null,
      })

      return addUserToAttendee(handle, attendeeWithoutUser, user)
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
      attendance: Attendance,
      { bypassCriteria, immediate = false }
    ) {
      if (attendee.reserved) {
        return true
      }

      const isPastReserveTime = !isFuture(attendee.earliestReservationAt)
      const poolHasCapacity = pool.numAttendees < pool.capacity

      if ((isPastReserveTime && poolHasCapacity) || bypassCriteria) {
        return await this.reserve(handle, attendance, attendee, immediate)
      }

      return false
    },
    async reserve(handle: DBHandle, attendance: Attendance, attendee: Attendee, immediate: boolean) {
      let paymentUrl = null
      let paymentDeadline = null
      let paymentId = null
      if (attendance.attendancePrice) {
        const payment = await paymentService.createProductPayment(
          attendance.id,
          attendance.attendancePrice,
          "http://localhost:3000/arrangementer/alle-avslutningskos/83f1d181-5eb1-4c62-b319-85d3c80f679f"
        )

        paymentDeadline = immediate ? addSeconds(new TZDate(), 60) : addHours(new TZDate(), 24)
        paymentUrl = payment.url
        paymentId = payment.id

        taskSchedulingService.scheduleAt(
          handle,
          tasks.VERIFY_PAYMENT.type,
          {
            attendeeId: attendee.id,
          },
          paymentDeadline
        )
      }

      return await attendeeRepository.reserveAttendee(handle, attendee.id, paymentUrl, paymentDeadline, paymentId)
    },
    async handleVerifyPaymentTask(handle, { attendeeId }) {
      const attendee = await attendeeRepository.getById(handle, attendeeId)

      if (attendee === null || attendee.paidAt) {
        return
      }
      await this.deregisterForEvent(handle, attendeeId, {
        bypassCriteriaOnReserveNextAttendee: false,
        reserveNextAttendee: true,
      })
    },
    async handleOnPaymentTask(handle, paymentId) {
      const attendee = await attendeeRepository.getByPayment(handle, paymentId)

      if (attendee === null || attendee.paidAt) {
        return
      }

      await attendeeRepository.update(handle, attendee.id, {
        paidAt: null,
        paymentDeadline: null,
        paymentLink: null,
      })
    },
    async getAttendeeStatuses(handle: DBHandle, userId: UserId, attendanceIds: AttendanceId[]) {
      return await attendeeRepository.getAttendeeStatuses(handle, userId, attendanceIds)
    },
    async removeSelectionResponses(handle: DBHandle, selectionId: string) {
      return await attendeeRepository.removeSelectionResponses(handle, selectionId)
    },
    async deregisterForEvent(
      handle: DBHandle,
      attendeeId: AttendeeId,
      { reserveNextAttendee, bypassCriteriaOnReserveNextAttendee }: AdminDeregisterForEventOptions
    ) {
      const attendance = await attendanceRepository.getByAttendeeId(handle, attendeeId)
      if (!attendance) {
        throw new AttendanceNotFound("")
      }
      const pool = await attendanceRepository.getPoolByAttendeeId(handle, attendeeId)
      if (!pool) {
        throw new AttendancePoolNotFoundError(`${attendeeId} (attendee id)`)
      }
      const attendee = await attendeeRepository.getById(handle, attendeeId)
      if (!attendee) {
        throw new AttendeeNotFoundError(attendeeId, attendance.id)
      }

      if (attendee.paymentId) {
        await paymentService.cancelProductPayment(attendee.paymentId)
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
        await this.attemptReserve(handle, nextUnreservedAttendee, pool, attendance, {
          bypassCriteria: bypassCriteriaOnReserveNextAttendee,
        })
      }
    },
  }
}
