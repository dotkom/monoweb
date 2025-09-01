import type { EventEmitter } from "node:events"
import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceSelection,
  type AttendanceWrite,
  AttendanceWriteSchema,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  AttendeeWriteSchema,
  DEFAULT_MARK_DURATION,
  type UserId,
  canUserAttendPool,
  findActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { getCurrentUTC, ogJoin, slugify } from "@dotkomonline/utils"
import { captureException } from "@sentry/node"
import { addHours, compareDesc, differenceInHours, isAfter, isBefore, isFuture, isPast } from "date-fns"
import invariant from "tiny-invariant"
import type { Configuration } from "../../configuration"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import { PaymentAlreadyChargedError, PaymentUnexpectedStateError } from "../payment/payment-error"
import type { PaymentProductsService } from "../payment/payment-products-service"
import type { Payment, PaymentService } from "../payment/payment-service"
import {
  type ChargeAttendancePaymentsTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyPaymentTaskDefinition,
  tasks,
} from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { UserService } from "../user/user-service"
import {
  AttendanceDeletionError,
  AttendanceNotFound,
  AttendanceValidationError,
  AttendeeAlreadyPaidError,
  AttendeeHasNotPaidError,
} from "./attendance-error"
import type { AttendanceRepository } from "./attendance-repository"
import type { EventService } from "./event-service"

type EventRegistrationOptions = {
  /** Should the user be registered regardless of if registration is closed? */
  ignoreRegistrationWindow: boolean
  /** Should the user be registered to the event regardless of if they are registered to the parent event? */
  ignoreRegisteredToParent: boolean
  /** Should the user be immediately reserved? */
  immediateReservation: boolean
  /**
   * Should the payment be scheduled with an immediate deadline? If not, a 24 hour window is given.
   */
  immediatePayment: boolean
  /**
   * Should the user be forced into a specific pool?
   *
   * If this field is set, the logic for determining which pool to register the user for is ignored, and the year
   * constraints for the pool are ignored.
   *
   * NOTE: This flag should PROBABLY only be used if you are calling registerAttendee as a system administrator.
   */
  forceAttendancePoolId: AttendancePoolId | null
}

type EventDeregistrationOptions = {
  ignoreDeregistrationWindow: boolean
}

/**
 * Service for managing attendance, attendance pools, and the attendees that are attending an event.
 *
 * The following describes in broad terms the terminology used, and how the service generally works:
 */
export interface AttendanceService {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  findAttendanceByPoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendance | null>
  findAttendanceByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance | null>
  getAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance>
  getAttendancesByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Attendance[]>
  getAttendanceByPoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendance>
  getAttendanceByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance>
  updateAttendanceById(
    handle: DBHandle,
    attendanceId: AttendanceId,
    data: Partial<AttendanceWrite>
  ): Promise<Attendance>

  /**
   * Create a new attendance pool for an event.
   *
   * There are a few rules that apply when creating a new pool:
   *
   * 1. There must not be any overlapping year criteria with any existing pools, as all pools are disjunctive sets with
   *    respect to the year criteria.
   * 2. We only support years 1 through 5. PhD students are counted as 5, and knights bypass the year criteria checks
   *    entirely.
   */
  createAttendancePool(handle: DBHandle, attendanceId: AttendanceId, data: AttendancePoolWrite): Promise<AttendancePool>
  deleteAttendancePool(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<void>
  updateAttendancePool(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId,
    data: AttendancePoolWrite
  ): Promise<AttendancePool>
  /**
   * Register an attendee for an event.
   *
   * Due to how the year constraints are modelled (disjunctive set of all years across all pools), there is ONLY ONE
   * pool that a user may be eligible to register for at a time. This means that we do not need to provide which pool
   * to register for, as we can programmatically determine this on our own.
   *
   * NOTE: This function does not necessarily register the attendee, it merely checks preconditions and schedules a task
   * to register the attendee which will be picked up by the task scheduling and executor services.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendance}.
   */
  registerAttendee(
    handle: DBHandle,
    attendanceId: AttendanceId,
    user: UserId,
    options: EventRegistrationOptions
  ): Promise<Attendee>
  updateAttendeeById(handle: DBHandle, attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<Attendee>
  executeReserveAttendeeTask(handle: DBHandle, task: InferTaskData<ReserveAttendeeTaskDefinition>): Promise<void>
  deregisterAttendee(handle: DBHandle, attendeeId: AttendeeId, options: EventDeregistrationOptions): Promise<void>

  updateAttendancePaymentProduct(handle: DBHandle, attendanceId: AttendanceId): Promise<void>
  updateAttendancePaymentPrice(handle: DBHandle, attendanceId: AttendanceId, price: number | null): Promise<void>
  deleteAttendancePayment(handle: DBHandle, attendance: Attendance): Promise<void>
  executeChargeAttendancePaymentsTask(
    handle: DBHandle,
    task: InferTaskData<ChargeAttendancePaymentsTaskDefinition>
  ): Promise<void>
  startAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, deadline: TZDate): Promise<Payment>
  cancelAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, refundedByUserId: UserId): Promise<void>
  requestAttendeePayment(handle: DBHandle, attendeeId: AttendeeId): Promise<Payment>
  completeAttendeePayment(handle: DBHandle, paymentId: string): Promise<void>
  createAttendeePaymentCharge(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  executeVerifyPaymentTask(handle: DBHandle, task: InferTaskData<VerifyPaymentTaskDefinition>): Promise<void>
  executeVerifyFeedbackAnsweredTask(
    handle: DBHandle,
    task: InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
  ): Promise<void>

  /**
   * Register that an attendee has physically attended an event.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendee}.
   */
  registerAttendance(handle: DBHandle, attendee: AttendeeId, at: TZDate | null): Promise<void>
  scheduleMergeEventPoolsTask(
    handle: DBHandle,
    attendanceId: AttendanceId,
    data: Pick<AttendancePoolWrite, "title">,
    mergeTime?: TZDate
  ): Promise<void>
  executeMergeEventPoolsTask(handle: DBHandle, task: InferTaskData<MergeAttendancePoolsTaskDefinition>): Promise<void>
}

export function getAttendanceService(
  eventEmitter: EventEmitter,
  attendanceRepository: AttendanceRepository,
  taskSchedulingService: TaskSchedulingService,
  userService: UserService,
  markService: MarkService,
  personalMarkService: PersonalMarkService,
  paymentService: PaymentService,
  paymentProductsService: PaymentProductsService,
  eventService: EventService,
  feedbackFormService: FeedbackFormService,
  feedbackAnswerService: FeedbackFormAnswerService,
  configuration: Configuration
): AttendanceService {
  const logger = getLogger("attendance-service")
  return {
    async createAttendance(handle, data) {
      validateAttendanceWrite(data)
      return await attendanceRepository.createAttendance(handle, data)
    },
    async findAttendanceById(handle, attendanceId) {
      return await attendanceRepository.findAttendanceById(handle, attendanceId)
    },
    async findAttendanceByPoolId(handle, attendancePoolId) {
      return await attendanceRepository.findAttendanceByPoolId(handle, attendancePoolId)
    },
    async findAttendanceByAttendeeId(handle, attendeeId) {
      return await attendanceRepository.findAttendanceByAttendeeId(handle, attendeeId)
    },
    async getAttendanceById(handle, attendanceId) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(attendanceId)
      }
      return attendance
    },
    async getAttendanceByPoolId(handle, attendancePoolId) {
      const attendance = await attendanceRepository.findAttendanceByPoolId(handle, attendancePoolId)
      if (!attendance) {
        throw new AttendanceNotFound(`Attendance for AttendancePool(ID=${attendancePoolId}) not found`)
      }
      return attendance
    },
    async getAttendanceByAttendeeId(handle, attendeeId) {
      const attendance = await attendanceRepository.findAttendanceByAttendeeId(handle, attendeeId)
      if (!attendance) {
        throw new AttendanceNotFound(`Attendance for Attendee(ID=${attendeeId}) not found`)
      }
      return attendance
    },
    async getAttendancesByIds(handle, attendanceIds) {
      return await attendanceRepository.findAttendancesByIds(handle, attendanceIds)
    },
    async updateAttendanceById(handle, attendanceId, data) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const input = AttendanceWriteSchema.parse({
        ...attendance,
        ...data,
      } satisfies AttendanceWrite)
      validateAttendanceWrite(input)

      // If there are any selections in the existing attendance that are not in the input, we remove them and all the
      // responses to them.
      if (data.selections !== undefined) {
        const selectionsForUpdate = attendance.selections.filter((selection) => {
          const next = input.selections.find((s) => s.id === selection.id)
          return next !== undefined && !isSelectionEqual(next, selection)
        })
        // TODO: Simplify this using a map or another constant time lookup because this is O(n^2) in the worst case.
        const affectedAttendees = attendance.attendees
          .map((attendee) => {
            const attendeeSelectionsForUpdate = attendee.selections.filter((selection) => {
              return selectionsForUpdate.some((s) => s.id === selection.selectionId)
            })
            const isAffected = attendeeSelectionsForUpdate.length > 0
            return { isAffected, selectionsForUpdate: attendeeSelectionsForUpdate, attendee }
          })
          .filter((attendee) => attendee.isAffected)
        // TODO: Collapse this into a single update query
        for (const { selectionsForUpdate, attendee } of affectedAttendees) {
          await this.updateAttendeeById(handle, attendee.id, {
            selections: selectionsForUpdate,
          })
        }
      }
      return await attendanceRepository.updateAttendanceById(handle, attendanceId, input)
    },
    async createAttendancePool(handle, attendanceId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceById(handle, attendanceId)
      validateAttendancePoolDisjunction(data.yearCriteria, attendance.pools)
      // If there are no years specified, we assume the pool is valid for all years not currently occupied by other
      // pools for the same attendance.
      if (data.yearCriteria.length === 0) {
        const remaining = [1, 2, 3, 4, 5]
        for (const pool of attendance.pools) {
          for (const year of pool.yearCriteria) {
            if (remaining.includes(year)) {
              remaining.splice(remaining.indexOf(year), 1)
            }
          }
        }
        if (remaining.length === 0) {
          throw new AttendanceDeletionError("Cannot create attendance pool as all years are occupied by other pools")
        }
        data.yearCriteria = remaining
      }
      return await attendanceRepository.createAttendancePool(handle, attendanceId, data)
    },
    async updateAttendancePool(handle, attendancePoolId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceByPoolId(handle, attendancePoolId)
      invariant(attendance.pools.some((p) => p.id === attendancePoolId))
      // Only pools except the current pool are relevant for the update.
      const relevantPools = attendance.pools.filter((pool) => pool.id !== attendancePoolId)
      validateAttendancePoolDisjunction(data.yearCriteria, relevantPools)
      return await attendanceRepository.updateAttendancePoolById(handle, attendancePoolId, data)
    },
    async deleteAttendancePool(handle, attendancePoolId) {
      await attendanceRepository.deleteAttendancePoolById(handle, attendancePoolId)
    },
    async registerAttendee(handle, attendanceId, userId, options) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const event = await eventService.getByAttendance(handle, attendance.id)
      const user = await userService.getById(handle, userId)
      if (attendance.attendees.some((a) => a.userId === userId)) {
        throw new AttendanceValidationError(
          `User(ID=${userId}) is already registered for Attendance(ID=${attendanceId})`
        )
      }

      // Ensure the attempted registration is within the registration window.
      if (isFuture(attendance.registerStart) && !options.ignoreRegistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot register user(ID=${userId}) for Attendance(ID=${attendanceId}) before registration start`
        )
      }
      if (isPast(attendance.registerEnd) && !options.ignoreRegistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot register user(ID=${userId}) for Attendance(ID=${attendanceId}) after registration end`
        )
      }

      if (event.parentId) {
        if (options.ignoreRegisteredToParent) {
          logger.info(
            "Bypassing registered to parent event requirements for Attendance(ID=%s) with parent Event(ID=%s) for User(Id=%s)",
            attendance.id,
            event.parentId,
            userId
          )
        } else {
          const parentAttendance = await attendanceRepository.findAttendanceByEventId(handle, event.parentId)

          // Check only if parent attendance exists
          if (parentAttendance) {
            const attendee = parentAttendance.attendees.find((a) => a.userId === userId)

            if (!attendee) {
              throw new AttendanceValidationError(
                `User(ID=${userId}) must be registered for parent Attendance(ID=${parentAttendance.id}) before registering for Attendance(ID=${attendanceId})`
              )
            }
            if (!attendee.reserved) {
              throw new AttendanceValidationError(
                `User(ID=${userId}) must be reserved in parent Attendance(ID=${parentAttendance.id}) before registering for Attendance(ID=${attendanceId})`
              )
            }
          }
        }
      }

      // Ensure the user has an active membership, and determine their effective grade
      const membership = findActiveMembership(user)
      if (membership === null) {
        throw new AttendanceValidationError(`User(ID=${userId}) cannot attend as they do not have an active membership`)
      }
      const grade = getMembershipGrade(membership)

      // If the user is suspended at time of registration, we simply do not register them at all.
      const punishment = await personalMarkService.findPunishmentByUserId(handle, userId)
      if (punishment?.suspended) {
        throw new AttendanceValidationError(
          `User(ID=${userId}) is suspended and cannot register for Attendance(ID=${attendanceId})`
        )
      }

      let applicablePool: AttendancePool | null = null
      // Attempting to override the attendance pool selection with the administrator flag only requires us to check that
      // the required pool exists.
      if (options.forceAttendancePoolId !== null) {
        logger.info(
          "Bypassing attendance pool requirements for Attendance(ID=%s) with AttendancePool(ID=%s) for User(Id=%s)",
          attendance.id,
          options.forceAttendancePoolId,
          userId
        )
        const pool = attendance.pools.find((p) => p.id === options.forceAttendancePoolId)
        if (pool === undefined) {
          throw new AttendanceValidationError(
            `Cannot register user for Attendance(ID=${attendanceId}) as the specified pool does not exist`
          )
        }
        applicablePool = pool
      } else {
        applicablePool = attendance.pools.find((pool) => canUserAttendPool(user, pool)) ?? null
      }

      if (applicablePool === null) {
        logger.warn(
          "User(ID=%s) attempted to register for Attendance(ID=%s) but no applicable pool was found",
          userId,
          attendanceId
        )
        throw new AttendanceValidationError(
          `User(ID=${userId}) cannot register for Attendance(ID=${attendanceId}) as no applicable pool was found`
        )
      }

      // Marking the attendee as registered is only half of the job, as we also schedule a task to reserve their place
      // in the pool
      let reservationTime = addHours(getCurrentUTC(), applicablePool.mergeDelayHours ?? 0)
      if (punishment !== null) {
        reservationTime = addHours(reservationTime, punishment.delay)
      }

      const poolAttendees = attendance.attendees.filter((a) => a.attendancePoolId === applicablePool.id && a.reserved)
      const isAvailableNow = !isFuture(reservationTime) && poolAttendees.length < applicablePool.capacity
      const isImmediate = options.immediateReservation || isAvailableNow
      const attendee = await attendanceRepository.createAttendee(handle, attendanceId, applicablePool.id, userId, {
        attendedAt: null,
        earliestReservationAt: reservationTime,
        reserved: isImmediate,
        selections: [],
        userGrade: grade,
      })

      if (attendance.attendancePrice) {
        const paymentDeadline = options.immediatePayment ? addHours(new TZDate(), 2) : addHours(new TZDate(), 24)
        const payment = await this.startAttendeePayment(handle, attendee.id, paymentDeadline)
        attendee.paymentDeadline = paymentDeadline
        attendee.paymentId = payment.id
        attendee.paymentLink = payment.url
        logger.info(
          "Attendee(ID=%s,UserID=%s) has been given until %s UTC to pay for Event(ID=%s) at link %s",
          attendee.id,
          attendee.user.id,
          paymentDeadline.toUTCString(),
          event.id,
          payment.url
        )
      }

      // When a user is immediately reserved, there is no reason to schedule a task for them.
      if (!options.immediateReservation) {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.RESERVE_ATTENDEE,
          {
            attendeeId: attendee.id,
            attendanceId,
          },
          reservationTime
        )
      }

      eventEmitter.emit("attendance:register-change", { attendee, status: "registered" })
      logger.info(
        "Attendee(ID=%s,UserID=%s) named %s has attended Event(ID=%s) named %s",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        event.id,
        event.title
      )

      return attendee
    },
    async updateAttendeeById(handle, attendeeId, data) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      invariant(attendee !== undefined)
      const input = AttendeeWriteSchema.parse({
        ...attendee,
        ...data,
      } satisfies AttendeeWrite)
      validateAttendeeWrite(input)
      return await attendanceRepository.updateAttendeeById(handle, attendeeId, input)
    },
    async executeReserveAttendeeTask(handle, { attendanceId, attendeeId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const attendee = attendance.attendees.find((a) => a.id === attendeeId)
      // NOTE: If the attendee does not exist, we have a non-critical bug in the app. The circumstances where this is
      // possible is when the attendee was removed from the attendance after the task was scheduled AND the task was not
      // cancelled.
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendanceId})`)
      }
      if (attendee.reserved) {
        return
      }

      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      invariant(pool !== undefined)
      const adjacentAttendees = attendance.attendees.filter((a) => a.attendancePoolId === pool.id && a.reserved)
      const isPoolAtMaxCapacity = adjacentAttendees.length >= pool.capacity
      const isPastReservationTime = isPast(attendee.earliestReservationAt)
      if (isPoolAtMaxCapacity || isPastReservationTime) {
        return
      }
      await attendanceRepository.updateAttendeeById(handle, attendeeId, {
        ...attendee,
        reserved: true,
      })
    },
    async deregisterAttendee(handle, attendeeId, options) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      // We must allow people to deregister if they are on the waitlist, hence the check for `attendee.reserved`
      if (attendee.reserved && isPast(attendance.deregisterDeadline) && !options.ignoreDeregistrationWindow) {
        throw new AttendanceValidationError(
          `Cannot deregister Attendee(ID=${attendeeId}) from Attendance(ID=${attendance.id}) after registration end`
        )
      }

      if (attendee.paymentId !== null) {
        await paymentService.cancel(attendee.paymentId)
      }
      await attendanceRepository.deleteAttendeeById(handle, attendeeId)
      const event = await eventService.getByAttendance(handle, attendance.id)

      eventEmitter.emit("attendance:register-change", { attendee, status: "deregistered" })
      logger.info(
        "Attendee(ID=%s,UserID=%s) named %s has unattended Event(ID=%s) named %s",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        event.id,
        event.title
      )

      // If the attendee was reserved, we find a replacement for them in the pool.
      if (attendee.reserved) {
        const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
        invariant(pool !== undefined)
        // We are now looking for a replacement for the attendee that just deregistered. The criteria that we need to
        // match are:
        //
        // 1. The attendee must be in the same pool as the deregistered attendee.
        // 2. The attendee must not yet be reserved
        // 3. The attendee must have a reservation time in the future
        const firstUnreservedAdjacentAttendee = attendance.attendees
          .filter((a) => a.attendancePoolId === pool.id)
          .filter((a) => !a.reserved)
          .filter((a) => isPast(a.earliestReservationAt))
          .toSorted((a, b) => compareDesc(a.earliestReservationAt, b.earliestReservationAt))
          .at(0)
        if (firstUnreservedAdjacentAttendee === undefined) {
          return
        }

        await attendanceRepository.updateAttendeeById(
          handle,
          firstUnreservedAdjacentAttendee.id,
          AttendeeWriteSchema.parse({
            ...firstUnreservedAdjacentAttendee,
            reserved: true,
          })
        )
        logger.info(
          "Attendee(ID=%s,UserID=%s) named %s has been reserved for Event(ID=%s) named %s because User(ID=%s) was deregistered",
          firstUnreservedAdjacentAttendee.id,
          firstUnreservedAdjacentAttendee.user.id,
          firstUnreservedAdjacentAttendee.user.name,
          event.id,
          event.title,
          attendee.id
        )
      }
    },
    async deleteAttendancePayment(handle, attendance: Attendance) {
      for (const attendee of attendance.attendees) {
        if (!attendee.paymentId) {
          continue
        }

        const payment = await paymentService.getById(attendee.paymentId)

        if (payment.status === "CANCELLED" || payment.status === "UNPAID") {
          continue
        }

        throw new AttendeeAlreadyPaidError(attendee.userId)
      }

      await attendanceRepository.updateAttendancePaymentPrice(handle, attendance.id, null)

      const task = await taskSchedulingService.findChargeAttendancePaymentsTask(handle, attendance.id)
      if (task) {
        await taskSchedulingService.cancel(handle, task.id)
      }
    },
    async updateAttendancePaymentPrice(handle, attendanceId, price) {
      if (price !== null && price < 0) {
        throw new AttendanceValidationError(`Tried to set negative price (${price}) for Attendance(ID=${attendanceId})`)
      }
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const isExistingProduct = attendance.attendancePrice !== null

      await attendanceRepository.updateAttendancePaymentPrice(handle, attendanceId, price)
      // If we have set a price in the past, we just update it, otherwise we need to make a new Stripe product.
      if (isExistingProduct) {
        // TODO: Is this switch really needed? Maybe it should delete the product if the price is null?
        if (price !== null) {
          await paymentProductsService.updatePrice(attendanceId, price)
        }
      } else {
        await this.updateAttendancePaymentProduct(handle, attendanceId)
      }
    },
    async updateAttendancePaymentProduct(handle, attendanceId) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      if (!attendance.attendancePrice) {
        return
      }
      const event = await eventService.getByAttendance(handle, attendance.id)

      const url = `${configuration.WEB_PUBLIC_ORIGIN}/arrangementer/${slugify(event.title)}/${event.id}`
      const groupsText = ogJoin(event.hostingGroups.map((group) => group.abbreviation))

      await paymentProductsService.createOrUpdate(attendance.id, {
        description:
          event.hostingGroups.length > 0 ? `Arrangert av ${groupsText}` : "Arrangert av Online linjeforening",
        name: event.title,
        imageUrl: event.imageUrl,
        metadata: {
          group: event.hostingGroups.map((group) => group.slug).join(", "),
        },
        price: attendance.attendancePrice,
        url,
      })
      await taskSchedulingService.scheduleAt(
        handle,
        tasks.CHARGE_ATTENDANCE_PAYMENTS,
        { attendanceId: attendance.id },
        new TZDate(attendance.deregisterDeadline)
      )
    },
    async executeChargeAttendancePaymentsTask(handle, { attendanceId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      logger.info("Executing Stripe charge for attendees of Attendance(ID=%s)", attendanceId)
      if (attendance.deregisterDeadline > getCurrentUTC()) {
        logger.warn(`Not charging ${attendanceId} because task is too early`)
        return
      }
      for (const attendee of attendance.attendees) {
        logger.info(`Charging attendee ${attendee.id}`)
        await this.createAttendeePaymentCharge(handle, attendee.id)
      }
    },
    async startAttendeePayment(handle, attendeeId, deadline): Promise<Payment> {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      if (!attendance.attendancePrice) {
        throw new Error("Tried to create a payment for an attendance without a price")
      }

      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (!attendee) {
        throw new AttendanceNotFound(attendeeId)
      }

      if (attendee.paymentId) {
        const existingPayment = await paymentService.getById(attendee.paymentId)

        if (existingPayment.status !== "CANCELLED") {
          throw new PaymentUnexpectedStateError(
            attendee.paymentId,
            "Tried to create new payment but one is already active"
          )
        }
      }

      const payment = await paymentService.create(
        attendance.id,
        attendee.user,
        isPast(attendance.deregisterDeadline) ? "CHARGE" : "RESERVE"
      )

      await attendanceRepository.updateAttendeePaymentById(handle, attendee.id, {
        paymentDeadline: deadline,
        paymentId: payment.id,
        paymentLink: payment.url,
        paymentRefundedAt: null,
        paymentRefundedById: null,
      })

      await taskSchedulingService.scheduleAt(
        handle,
        tasks.VERIFY_PAYMENT,
        {
          attendeeId,
        },
        deadline
      )

      return payment
    },
    async createAttendeePaymentCharge(handle, attendeeId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (!attendee.paymentId) {
        return
      }
      const payment = await paymentService.getById(attendee.paymentId)
      if (payment.status === "PAID") {
        return
      }

      try {
        await paymentService.charge(attendee.paymentId)
        await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
          paymentChargedAt: getCurrentUTC(),
        })
      } catch (e) {
        if (e instanceof PaymentAlreadyChargedError) {
          logger.info(`Attendee ${attendee.id} has already been charged`)

          await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
            paymentChargedAt: getCurrentUTC(),
          })
        } else {
          logger.error("Failed to charge attendee", attendee.id, e)
          captureException(e)
        }
      }
    },
    async cancelAttendeePayment(handle, attendeeId, refundedByUserId: UserId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }
      if (!attendee.paymentId) {
        throw new AttendeeHasNotPaidError(attendee.userId)
      }

      const payment = await paymentService.getById(attendee.paymentId)
      if (payment.status === "PAID") {
        await paymentService.refund(attendee.paymentId)
      } else if (payment.status === "RESERVED" || payment.status === "UNPAID") {
        await paymentService.cancel(attendee.paymentId)
      } else {
        throw new AttendeeHasNotPaidError(attendee.paymentId)
      }
      await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
        paymentChargedAt: null,
        paymentId: null,
        paymentDeadline: null,
        paymentLink: null,
        paymentReservedAt: null,
        paymentRefundedAt: getCurrentUTC(),
        paymentRefundedById: refundedByUserId,
      })

      const task = await taskSchedulingService.findVerifyPaymentTask(handle, attendeeId)
      if (task) {
        await taskSchedulingService.cancel(handle, task.id)
      }
    },
    async completeAttendeePayment(handle, paymentId) {
      const attendance = await attendanceRepository.findAttendanceByAttendeePaymentId(handle, paymentId)
      if (attendance === null) {
        throw new AttendanceNotFound(`Attendance for Payment(ID=${paymentId}) not found`)
      }
      const attendee = attendance.attendees.find((attendee) => attendee.paymentId === paymentId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(
          `Attendee for Payment(ID=${paymentId}) not found in Attendance(ID=${attendance.id})`
        )
      }

      if (attendee.paymentReservedAt || !attendee.paymentDeadline) {
        return
      }

      const payment = await paymentService.getById(paymentId)
      if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
        throw new PaymentUnexpectedStateError(paymentId, "Got webhook about payment but API does not say so")
      }

      await attendanceRepository.updateAttendeePaymentById(handle, attendee.id, {
        paymentReservedAt: getCurrentUTC(),
        paymentChargedAt: payment.status === "PAID" ? getCurrentUTC() : null,
        paymentDeadline: null,
        paymentLink: null,
      })
    },
    async requestAttendeePayment(handle, attendeeId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
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
      const payment = await this.startAttendeePayment(handle, attendeeId, paymentDeadline)

      await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
        paymentChargedAt: null,
        paymentId: payment.id,
        paymentDeadline,
        paymentLink: payment.url,
        paymentReservedAt: null,
        paymentRefundedAt: null,
        paymentRefundedById: null,
      })

      await taskSchedulingService.scheduleAt(handle, tasks.VERIFY_PAYMENT, { attendeeId }, paymentDeadline)

      return payment
    },
    async executeVerifyPaymentTask(handle, { attendeeId }) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.paymentId === null || attendee.paymentReservedAt) {
        return
      }

      const payment = await paymentService.getById(attendee.paymentId)

      if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
        await this.deregisterAttendee(handle, attendeeId, {
          // TODO: Maybe this should be false?
          ignoreDeregistrationWindow: true,
        })
      } else {
        await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
          paymentReservedAt: getCurrentUTC(),
          paymentChargedAt: payment.status === "PAID" ? getCurrentUTC() : null,
          paymentDeadline: null,
          paymentLink: null,
        })
      }
    },
    async executeVerifyFeedbackAnsweredTask(handle, { feedbackFormId }) {
      const feedbackForm = await feedbackFormService.getById(handle, feedbackFormId)

      const attendance = await attendanceRepository.findAttendanceByEventId(handle, feedbackForm.eventId)
      const event = await eventService.getEventById(handle, feedbackForm.eventId)
      const attendees = attendance?.attendees ?? []

      if (attendees.length === 0) {
        return
      }

      const answers = await feedbackAnswerService.getAllAnswers(handle, feedbackForm.id)

      if (!isPast(feedbackForm.answerDeadline)) {
        throw new Error("executeVerifyFeedbackAnsweredTask tried to run before answerDeadline on feedback form passed")
      }

      const attendeesWithoutAnswers = attendees.filter(
        (attendee) => !answers.some((answer) => answer.attendeeId === attendee.id)
      )

      if (attendeesWithoutAnswers.length === 0) return

      const mark = await markService.createMark(
        handle,
        {
          title: `Manglende tilbakemelding på ${event.title}`,
          duration: DEFAULT_MARK_DURATION,
          type: "MISSING_FEEDBACK",
          weight: 2,
          details: null,
        },
        event.hostingGroups.map((group) => group.slug)
      )

      for (const attendee of attendeesWithoutAnswers) {
        await personalMarkService.addToUser(handle, attendee.user.id, mark.id)
      }
    },
    async registerAttendance(handle, attendeeId, at = getCurrentUTC()) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new AttendanceNotFound(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.attendedAt !== null && at !== null) {
        return
      }

      await attendanceRepository.updateAttendeeById(
        handle,
        attendeeId,
        AttendeeWriteSchema.parse({
          ...attendee,
          attendedAt: at,
        })
      )
    },
    async scheduleMergeEventPoolsTask(handle, attendanceId, data, mergeTime) {
      if (mergeTime === undefined) {
        await this.executeMergeEventPoolsTask(handle, { attendanceId, data, previousPoolMergeTime: getCurrentUTC() })
        return
      }
      await taskSchedulingService.scheduleAt(
        handle,
        tasks.MERGE_ATTENDANCE_POOLS,
        {
          data,
          previousPoolMergeTime: mergeTime,
          attendanceId,
        },
        mergeTime
      )
    },
    async executeMergeEventPoolsTask(handle, { attendanceId, previousPoolMergeTime, data }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const isMergeable = (pool: AttendancePool) => {
        if (pool.mergeDelayHours === null) {
          return true
        }
        const mergeEligibleAt = addHours(attendance.registerStart, pool.mergeDelayHours)
        return isAfter(previousPoolMergeTime, mergeEligibleAt)
      }
      // TODO: Maybe use a utility for partitioning the pools rather than two filters?
      // A pending pool is one that is not yet mergeable, in other words; it has not yet passed the merge delay hours
      // from registration start.
      const mergeablePools = attendance.pools.filter(isMergeable)
      const pendingPools = attendance.pools.filter((pool) => !isMergeable(pool))
      // Depending on if there is zero or one pools, we either update the matching pool, or do nothing
      if (mergeablePools.length <= 1) {
        if (mergeablePools.length === 1) {
          const pool = mergeablePools.at(0)
          invariant(pool !== undefined)
          await attendanceRepository.updateAttendancePoolById(handle, pool.id, {
            ...pool,
            title: data.title,
          })
        }
        return
      }

      // We compute the next properties by summing up for all the pools. The next pool should not have a merge delay
      // since a potential pending pool should be merged into it.
      const defaultMergePool = {
        title: data.title,
        mergeDelayHours: null,
        capacity: 0,
        yearCriteria: [] as number[],
      } satisfies AttendancePoolWrite
      const input = mergeablePools.reduce((acc, curr) => {
        return {
          title: acc.title,
          mergeDelayHours: acc.mergeDelayHours,
          capacity: acc.capacity + curr.capacity,
          yearCriteria: acc.yearCriteria.concat(...curr.yearCriteria),
        }
      }, defaultMergePool)
      validateAttendancePoolWrite(input)
      validateAttendancePoolDisjunction(input.yearCriteria, pendingPools)
      const pool = await attendanceRepository.createAttendancePool(handle, attendanceId, input)
      const mergeablePoolIds = mergeablePools.map((pool) => pool.id)
      await attendanceRepository.updateAttendeeAttendancePoolIdByAttendancePoolIds(handle, mergeablePoolIds, pool.id)
      await attendanceRepository.deleteAttendancePoolsByIds(handle, mergeablePoolIds)
    },
  }
}

function isSelectionEqual(left: AttendanceSelection, right: AttendanceSelection): boolean {
  const isWeaklyEqual = left.id === right.id && left.name === right.name && left.options.length === right.options.length
  const isOptionSetEqual = left.options.every((lOption) => {
    const rOption = right.options.find((rOption) => rOption.id === lOption.id)
    return rOption?.name === lOption.name
  })
  return isWeaklyEqual && isOptionSetEqual
}

function validateAttendanceWrite(data: AttendanceWrite) {
  if (isBefore(data.registerEnd, data.registerStart)) {
    throw new AttendanceValidationError("Cannot specify registration end before start")
  }
  if (Math.abs(differenceInHours(data.registerStart, data.registerEnd)) < 1) {
    throw new AttendanceValidationError("Registration time must be at least one hour long")
  }
}

function validateAttendancePoolWrite(data: AttendancePoolWrite) {
  if (data.mergeDelayHours !== null && (data.mergeDelayHours < 0 || data.mergeDelayHours > 48)) {
    throw new AttendanceValidationError("Merge delay for pool must be between 0 and 48 hours")
  }
  if (data.capacity < 0) {
    throw new AttendanceValidationError("Capacity for pool must be zero or positive")
  }
  if (data.yearCriteria.some((v) => v < 1 || v > 5)) {
    throw new AttendanceValidationError("Year criteria must be between 1 and 5")
  }
}

/**
 * Ensure the planned year constraints do not cause an overlap with existing pools.
 */
function validateAttendancePoolDisjunction(plan: number[], pools: AttendancePool[]) {
  const currentYearConstraints = pools.reduce((acc, curr) => {
    // biome-ignore lint/performance/noAccumulatingSpread: this set has max 5 entries, and thus max 5 iterations
    return new Set([...acc, ...curr.yearCriteria])
  }, new Set<number>())

  const isOverlapping = plan.some((y) => currentYearConstraints.has(y))
  if (isOverlapping) {
    throw new AttendanceValidationError("Planned years overlap with existing constrains defined in existing pools")
  }
}

function validateAttendeeWrite(data: AttendeeWrite) {
  // This is mostly a sanity check
  if (data.userGrade !== null && (data.userGrade > 5 || data.userGrade < 1)) {
    throw new AttendanceValidationError("User grade must be between 1 and 5")
  }
}
