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
import { getCurrentUTC } from "@dotkomonline/utils"
import { addHours, addMinutes, addSeconds, isFuture, isPast } from "date-fns"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import { PaymentAlreadyChargedError, PaymentUnexpectedStateError } from "../payment/payment-error"
import type { Payment, PaymentService } from "../payment/payment-service"
import { type InferTaskData, type VerifyPaymentTaskDefinition, tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { UserService } from "../user/user-service"
import { AttendanceDeregisterClosedError, AttendanceNotFound, AttendanceNotOpenError } from "./attendance-error"
import { AttendancePoolNotFoundError, WrongAttendancePoolError } from "./attendance-pool-error"
import type { AttendanceRepository } from "./attendance-repository"
import {
  AttendeeAlreadyPaidError,
  AttendeeDeregistrationError,
  AttendeeHasNotPaidError,
  AttendeeNotFoundError,
  AttendeeRegistrationError,
} from "./attendee-error"
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
  createPayment(handle: DBHandle, attendeeId: AttendeeId, deadline: TZDate): Promise<Payment>
  requestPayment(handle: DBHandle, attendeeId: string): Promise<Payment>
  refundAttendee(handle: DBHandle, attendeeId: string, refundedById: string): Promise<void>
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
  chargeAttendee(handle: DBHandle, attendeeId: string): Promise<void>
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
    async requestPayment(handle: DBHandle, attendeeId: string) {
      const attendee = await attendeeRepository.getById(handle, attendeeId)
      if (!attendee) {
        throw new AttendeeNotFoundError(attendeeId, "")
      }

      if (attendee.paymentId) {
        const payment = await paymentService.getById(attendee.paymentId)
        if (payment.status === "PAID" || payment.status === "RESERVED") {
          throw new AttendeeAlreadyPaidError(attendee.userId)
        }
        if (payment.status === "UNPAID" && payment.url) {
          return payment
        }
      }

      const paymentDeadline = addHours(getCurrentUTC(), 24)

      const payment = await this.createPayment(handle, attendeeId, paymentDeadline)

      await attendeeRepository.update(handle, attendeeId, {
        paymentChargedAt: null,
        paymentId: payment.id,
        paymentDeadline,
        paymentLink: payment.url,
        paymentReservedAt: null,
        paymentRefundedAt: null,
        paymentRefundedById: null,
      })

      return payment
    },
    async refundAttendee(handle: DBHandle, attendeeId: string, refundedById: string) {
      const attendee = await attendeeRepository.getById(handle, attendeeId)
      if (!attendee) {
        throw new AttendeeNotFoundError(attendeeId, "")
      }
      if (!attendee.paymentId || (!attendee.paymentChargedAt && !attendee.paymentReservedAt)) {
        throw new AttendeeHasNotPaidError(attendee.userId)
      }

      const payment = await paymentService.getById(attendee.paymentId)
      if (payment.status === "PAID") {
        await paymentService.refund(attendee.paymentId)
      } else {
        await paymentService.cancel(attendee.paymentId)
      }
      await attendeeRepository.update(handle, attendeeId, {
        paymentChargedAt: null,
        paymentId: null,
        paymentDeadline: null,
        paymentLink: null,
        paymentReservedAt: null,
        paymentRefundedAt: getCurrentUTC(),
        paymentRefundedById: refundedById,
      })
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
        await paymentService.cancel(attendee.paymentId)
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
        paymentChargedAt: null,
        paymentReservedAt: null,
        paymentId: null,
        paymentRefundedAt: null,
        paymentRefundedById: null,
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
        paymentDeadline: null,
        paymentLink: null,
        paymentId: null,
        paymentReservedAt: null,
        paymentChargedAt: null,
        paymentRefundedAt: null,
        paymentRefundedById: null,
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
      let payment: Payment | null = null

      const paymentDeadline = immediate ? addMinutes(new TZDate(), 15) : addHours(new TZDate(), 24)

      if (attendance.attendancePrice) {
        payment = await this.createPayment(handle, attendee.id, paymentDeadline)
      }

      return await attendeeRepository.reserveAttendee(handle, attendee.id, payment, paymentDeadline)
    },
    async createPayment(handle: DBHandle, attendeeId: AttendeeId, deadline: TZDate) {
      const attendance = await attendanceRepository.getByAttendeeId(handle, attendeeId)
      if (!attendance) {
        throw new AttendanceNotFound(`attendeeId: ${attendeeId}`)
      }
      if (!attendance.attendancePrice) {
        throw new Error("Tried to create a payment for an attendance without a price")
      }

      const payment = await paymentService.create(
        attendance.id,
        isPast(attendance.deregisterDeadline) ? "CHARGE" : "RESERVE"
      )

      taskSchedulingService.scheduleAt(
        handle,
        tasks.VERIFY_PAYMENT.type,
        {
          attendeeId,
        },
        deadline
      )

      return payment
    },
    async handleVerifyPaymentTask(handle, { attendeeId }) {
      const attendee = await attendeeRepository.getById(handle, attendeeId)

      if (attendee === null || attendee.paymentId === null || attendee.paymentReservedAt) {
        return
      }

      const payment = await paymentService.getById(attendee.paymentId)

      if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
        await this.deregisterForEvent(handle, attendeeId, {
          bypassCriteriaOnReserveNextAttendee: false,
          reserveNextAttendee: true,
        })
      } else {
        await attendeeRepository.update(handle, attendee.id, {
          paymentReservedAt: getCurrentUTC(),
          paymentChargedAt: payment.status === "PAID" ? getCurrentUTC() : null,
          paymentDeadline: null,
          paymentLink: null,
        })
      }
    },
    async handleOnPaymentTask(handle, paymentId) {
      const attendee = await attendeeRepository.getByPayment(handle, paymentId)

      if (attendee === null || attendee.paymentReservedAt || !attendee.paymentDeadline) {
        return
      }

      const payment = await paymentService.getById(paymentId)

      if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
        throw new PaymentUnexpectedStateError(paymentId, "Got webhook about payment but API does not say so")
      }

      await attendeeRepository.update(handle, attendee.id, {
        paymentReservedAt: getCurrentUTC(),
        paymentChargedAt: payment.status === "PAID" ? getCurrentUTC() : null,
        paymentDeadline: null,
        paymentLink: null,
      })
    },
    async chargeAttendee(handle, attendeeId: string) {
      const attendee = await attendeeRepository.getById(handle, attendeeId)
      if (!attendee) {
        throw new AttendeeNotFoundError(attendeeId, "")
      }
      if (!attendee.paymentId) {
        return
      }
      if (attendee.paymentChargedAt) {
        return
      }

      try {
        await paymentService.charge(attendee.paymentId)
        await attendeeRepository.update(handle, attendeeId, {
          paymentChargedAt: getCurrentUTC(),
        })
      } catch (e) {
        if (e instanceof PaymentAlreadyChargedError) {
          console.log(`Attendee ${attendee.id} as they have already been charged`)

          await attendeeRepository.update(handle, attendeeId, {
            paymentChargedAt: getCurrentUTC(),
          })
        } else {
          console.error("Failed to charge attendee", attendee.id, e)
        }
      }
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
        await paymentService.cancel(attendee.paymentId)
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
