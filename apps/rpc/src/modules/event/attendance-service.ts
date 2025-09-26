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
  type Event,
  type GroupType,
  type UserId,
  canUserAttendPool,
  findActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { createAbsoluteEventPageUrl, createPoolName, getCurrentUTC, ogJoin, slugify } from "@dotkomonline/utils"
import {
  addDays,
  addHours,
  compareAsc,
  differenceInHours,
  endOfYesterday,
  isBefore,
  isFuture,
  isPast,
  min,
  startOfYesterday,
} from "date-fns"
import invariant from "tiny-invariant"
import type { Configuration } from "../../configuration"
import {
  FailedPreconditionError,
  IllegalStateError,
  InvalidArgumentError,
  NotFoundError,
  ResourceExhaustedError,
} from "../../error"
import type { EmailService } from "../email/email-service"
import { emails } from "../email/email-template"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentProductsService } from "../payment/payment-products-service"
import type { Payment, PaymentService } from "../payment/payment-service"
import {
  type ChargeAttendeeTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyPaymentTaskDefinition,
  tasks,
} from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { UserService } from "../user/user-service"
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
  getAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendee>
  updateAttendeeById(handle: DBHandle, attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<Attendee>
  executeReserveAttendeeTask(handle: DBHandle, task: InferTaskData<ReserveAttendeeTaskDefinition>): Promise<void>
  deregisterAttendee(handle: DBHandle, attendeeId: AttendeeId, options: EventDeregistrationOptions): Promise<void>
  findChargeAttendeeScheduleDate(handle: DBHandle, attendeeId: AttendeeId): Promise<Date | null>

  updateAttendancePaymentProduct(handle: DBHandle, attendanceId: AttendanceId): Promise<void>
  updateAttendancePaymentPrice(handle: DBHandle, attendanceId: AttendanceId, price: number | null): Promise<void>
  deleteAttendancePayment(handle: DBHandle, attendance: Attendance): Promise<void>
  executeChargeAttendeeTask(handle: DBHandle, task: InferTaskData<ChargeAttendeeTaskDefinition>): Promise<void>
  startAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, deadline: TZDate): Promise<Payment>
  cancelAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, refundedByUserId: UserId): Promise<void>
  completeAttendeePayment(handle: DBHandle, paymentId: string): Promise<void>
  createAttendeePaymentCharge(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  executeVerifyPaymentTask(handle: DBHandle, task: InferTaskData<VerifyPaymentTaskDefinition>): Promise<void>
  executeVerifyFeedbackAnsweredTask(
    handle: DBHandle,
    task: InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
  ): Promise<void>
  executeSendFeedbackFormLinkEmails(handle: DBHandle): Promise<void>

  /**
   * Register that an attendee has physically attended an event.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendee}.
   */
  registerAttendance(handle: DBHandle, attendee: AttendeeId, at: TZDate | null): Promise<void>
  scheduleMergeEventPoolsTask(handle: DBHandle, attendanceId: AttendanceId, mergeTime: TZDate): Promise<void>
  rescheduleMergeEventPoolsTask(handle: DBHandle, attendanceId: AttendanceId, mergeTime: TZDate | null): Promise<void>
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
  configuration: Configuration,
  emailService: EmailService
): AttendanceService {
  const logger = getLogger("attendance-service")
  function sendEventRegistrationEmail(event: Event, attendance: Attendance, attendee: Attendee) {
    if (attendee.user.email === null) {
      return
    }
    const organizerEmails = event.hostingGroups.map((g) => g.email).filter((email) => email !== null)
    // NOTE: We do not await here, because we don't want to delay the response to the user for sending the email.
    // AWS SES can be slow to fulfill, and this is an asynchronous operation anyway.
    void emailService.send(
      "noreply@online.ntnu.no",
      organizerEmails,
      [attendee.user.email],
      [],
      [],
      `Du er påmeldt ${event.title} hos Linjeforeningen Online`,
      emails.EVENT_ATTENDANCE,
      {
        deregistrationDeadline: attendance.deregisterDeadline.toISOString(),
        eventName: event.title,
        eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
      }
    )
  }
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
        throw new NotFoundError(`Attendance(ID=${attendanceId}) not found`)
      }
      return attendance
    },
    async getAttendanceByPoolId(handle, attendancePoolId) {
      const attendance = await attendanceRepository.findAttendanceByPoolId(handle, attendancePoolId)
      if (!attendance) {
        throw new NotFoundError(`Attendance for AttendancePool(ID=${attendancePoolId}) not found`)
      }
      return attendance
    },
    async getAttendanceByAttendeeId(handle, attendeeId) {
      const attendance = await attendanceRepository.findAttendanceByAttendeeId(handle, attendeeId)
      if (!attendance) {
        throw new NotFoundError(`Attendance for Attendee(ID=${attendeeId}) not found`)
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
          throw new FailedPreconditionError(
            `Cannot create new AttendancePool on Attendance(ID=${attendanceId}) as all years are occupied by other pools`
          )
        }
        data.yearCriteria = remaining
      }

      const createdPool = await attendanceRepository.createAttendancePool(handle, attendanceId, data)

      if (data.mergeDelayHours) {
        const mergeTime = new TZDate(addHours(attendance.registerStart, data.mergeDelayHours))
        await this.scheduleMergeEventPoolsTask(handle, attendance.id, mergeTime)
      }

      return createdPool
    },
    async updateAttendancePool(handle, attendancePoolId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceByPoolId(handle, attendancePoolId)

      // Only pools except the current pool are relevant for the update.
      const relevantPools = attendance.pools.filter((pool) => pool.id !== attendancePoolId)
      validateAttendancePoolDisjunction(data.yearCriteria, relevantPools)

      const mergeTime = data.mergeDelayHours
        ? new TZDate(addHours(attendance.registerStart, data.mergeDelayHours))
        : null
      await this.rescheduleMergeEventPoolsTask(handle, attendance.id, mergeTime)

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
        throw new FailedPreconditionError(`User(ID=${userId}) is already registered for Attendance(ID=${attendanceId})`)
      }

      // Ensure the attempted registration is within the registration window.
      if (isFuture(attendance.registerStart) && !options.ignoreRegistrationWindow) {
        throw new FailedPreconditionError(
          `Cannot register user(ID=${userId}) for Attendance(ID=${attendanceId}) before registration start`
        )
      }
      if (isPast(attendance.registerEnd) && !options.ignoreRegistrationWindow) {
        throw new FailedPreconditionError(
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
              throw new FailedPreconditionError(
                `User(ID=${userId}) must be registered for parent Attendance(ID=${parentAttendance.id}) before registering for Attendance(ID=${attendanceId})`
              )
            }
            if (!attendee.reserved) {
              throw new FailedPreconditionError(
                `User(ID=${userId}) must be reserved in parent Attendance(ID=${parentAttendance.id}) before registering for Attendance(ID=${attendanceId})`
              )
            }
          }
        }
      }

      // Ensure the user has an active membership, and determine their effective grade
      const membership = findActiveMembership(user)
      if (membership === null) {
        throw new FailedPreconditionError(`User(ID=${userId}) cannot attend as they do not have an active membership`)
      }
      const grade = getMembershipGrade(membership)

      // If the user is suspended at time of registration, we simply do not register them at all.
      const punishment = await personalMarkService.findPunishmentByUserId(handle, userId)
      if (punishment?.suspended) {
        throw new FailedPreconditionError(
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
          throw new FailedPreconditionError(
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
        throw new FailedPreconditionError(
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
      const isAvailableNow =
        !isFuture(reservationTime) && (applicablePool.capacity === 0 || poolAttendees.length < applicablePool.capacity)
      const isImmediate = options.immediateReservation || isAvailableNow
      const attendee = await attendanceRepository.createAttendee(handle, attendanceId, applicablePool.id, userId, {
        attendedAt: null,
        earliestReservationAt: reservationTime,
        reserved: isImmediate,
        selections: [],
        userGrade: grade,
      })

      if (attendance.attendancePrice) {
        const paymentDeadline = options.immediatePayment ? addHours(new TZDate(), 1) : addHours(new TZDate(), 24)
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

      // Immediate reservations go through right away, otherwise we schedule a task to handle the reservation at the
      // appropriate time. In this case, the email is sent when the reservation becomes effective.
      if (isImmediate) {
        sendEventRegistrationEmail(event, attendance, attendee)
      } else {
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
        "Attendee(ID=%s,UserID=%s) named %s has registered (effective %s) for Event(ID=%s) named %s with options: %o",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        reservationTime,
        event.id,
        event.title,
        options
      )

      return attendee
    },
    async getAttendeeById(handle, attendeeId) {
      const attendee = await attendanceRepository.findAttendeeById(handle, attendeeId)
      if (!attendee) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found`)
      }

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
      const event = await eventService.getByAttendance(handle, attendance.id)
      const attendee = attendance.attendees.find((a) => a.id === attendeeId)
      // NOTE: If the attendee does not exist, we have a non-critical bug in the app. The circumstances where this is
      // possible is when the attendee was removed from the attendance after the task was scheduled AND the task was not
      // cancelled.
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendanceId})`)
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

      const data = AttendeeWriteSchema.parse(attendee)
      data.reserved = true

      await attendanceRepository.updateAttendeeById(handle, attendeeId, data)
      sendEventRegistrationEmail(event, attendance, attendee)
    },
    async deregisterAttendee(handle, attendeeId, options) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      // We must allow people to deregister if they are on the waitlist, hence the check for `attendee.reserved`
      if (attendee.reserved && isPast(attendance.deregisterDeadline) && !options.ignoreDeregistrationWindow) {
        throw new FailedPreconditionError(
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
        "Attendee(ID=%s,UserID=%s) named %s has deregistered from Event(ID=%s) named %s with options: %o",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        event.id,
        event.title,
        options
      )

      // If the attendee was reserved, we find a replacement for them in the pool.
      if (attendee.reserved) {
        const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
        invariant(pool !== undefined)
        // We are now looking for a replacement for the attendee that just deregistered. The criteria that we need to
        // match are:
        //
        // 1. The attendee must be in the same pool as the deregistered attendee
        // 2. The attendee must not already be reserved
        // 3. The attendee must have a reservation time not in the future
        const firstUnreservedAdjacentAttendee = attendance.attendees
          .filter((a) => a.attendancePoolId === pool.id)
          .filter((a) => !a.reserved)
          .filter((a) => !isFuture(a.earliestReservationAt))
          .toSorted((a, b) => compareAsc(a.earliestReservationAt, b.earliestReservationAt))
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
          firstUnreservedAdjacentAttendee.user.name || "<missing name>",
          event.id,
          event.title,
          attendee.id
        )
      }
    },
    async findChargeAttendeeScheduleDate(handle, attendeeId) {
      const attendee = await this.getAttendeeById(handle, attendeeId)

      if (!attendee.paymentId) {
        return null
      }

      const job = await taskSchedulingService.findChargeAttendeeTask(handle, attendeeId)

      if (!job) {
        return null
      }

      return job.scheduledAt
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

        throw new ResourceExhaustedError(
          `Cannot delete payment for Attendance(ID=${attendance.id}) as Attendee(ID=${attendee.id}) has an active payment`
        )
      }

      const updatedAttendance = await attendanceRepository.updateAttendancePaymentPrice(handle, attendance.id, null)
      // TODO: N+1 Query
      const promises = updatedAttendance.attendees.map(async (attendee) => {
        return await taskSchedulingService.findChargeAttendeeTask(handle, attendee.id)
      })
      const tasks = await Promise.all(promises)
      const errors: Error[] = []
      for (const task of tasks) {
        if (task === null) {
          continue
        }
        // Run them in a try-catch block and optionally build an AggregateError to prevent one failed cancel to stop
        // all other tasks from being cancelled.
        try {
          await taskSchedulingService.cancel(handle, task.id)
        } catch (e) {
          logger.error("Received error when attempting to cancel task: %o", e)
          if (e instanceof Error) {
            errors.push(e)
          }
        }
      }
      if (errors.length !== 0) {
        throw new AggregateError(errors, "Failed to cancel one or more tasks")
      }
    },
    async updateAttendancePaymentPrice(handle, attendanceId, price) {
      if (price !== null && price < 0) {
        throw new InvalidArgumentError(`Tried to set negative price (${price}) for Attendance(ID=${attendanceId})`)
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
    },
    async executeChargeAttendeeTask(handle, { attendeeId }) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((a) => a.id === attendeeId)
      if (!attendee) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }
      logger.info("Executing Stripe charge for Attendee(ID=%s) of Attendance(ID=%s)", attendee.id, attendance.id)
      if (attendance.deregisterDeadline > getCurrentUTC()) {
        logger.error(
          "Cancelling charge of Attendee(ID=%s) as task is scheduled too early. This is likely a bug",
          attendee.id
        )
        return
      }
      await this.createAttendeePaymentCharge(handle, attendee.id)
    },
    async startAttendeePayment(handle, attendeeId, deadline): Promise<Payment> {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      if (!attendance.attendancePrice) {
        throw new Error("Tried to create a payment for an attendance without a price")
      }

      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (!attendee) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.paymentId) {
        const existingPayment = await paymentService.getById(attendee.paymentId)

        if (existingPayment.status !== "CANCELLED") {
          throw new IllegalStateError(
            `Tried to create new payment for Attendee(ID=${attendeeId}) but existing Payment(ID=${existingPayment.id} is still active`
          )
        }
      }

      const isImmediatePayment = isPast(attendance.deregisterDeadline)
      const payment = await paymentService.create(
        attendance.id,
        attendee.user,
        isImmediatePayment ? "CHARGE" : "RESERVE"
      )

      // This task has to be scheduled regardless, as the user still has the `deadline` time to make the payment
      // regardless of whether its a charge or a reservation.
      await taskSchedulingService.scheduleAt(
        handle,
        tasks.VERIFY_PAYMENT,
        {
          attendeeId,
        },
        deadline
      )
      // We attempt to put a "hold" on the user's credit card for as long as possible. From experience, Visa and
      // MasterCard allow a hold to be kept on an account for 7 days. To allow for leeway and clock tolerance, we set
      // the limit to 5 days.
      //
      // If the deadline for the event is earlier than those 5 days, we use that, as its no longer allowed to be
      // deregistered from a paid event after the deregistration deadline without consequences imposed by the
      // organizing committee.
      const maximalChargeTime = min([addDays(getCurrentUTC(), 5), new TZDate(attendance.deregisterDeadline)])

      if (!isImmediatePayment) {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.CHARGE_ATTENDEE,
          { attendeeId: attendee.id },
          new TZDate(maximalChargeTime)
        )
      }

      await attendanceRepository.updateAttendeePaymentById(handle, attendee.id, {
        paymentDeadline: deadline,
        paymentId: payment.id,
        paymentLink: payment.url,
        paymentRefundedAt: null,
        paymentRefundedById: null,
        paymentChargeDeadline: isImmediatePayment ? null : maximalChargeTime,
      })

      return payment
    },
    async createAttendeePaymentCharge(handle, attendeeId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
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
        if (e instanceof ResourceExhaustedError) {
          logger.info(`Attendee ${attendee.id} has already been charged`)

          await attendanceRepository.updateAttendeePaymentById(handle, attendeeId, {
            paymentChargedAt: getCurrentUTC(),
          })
        } else {
          logger.error("Failed to charge Attendee(ID=%s): %o", attendee.id, e)
          throw e
        }
      }
    },
    async cancelAttendeePayment(handle, attendeeId, refundedByUserId: UserId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }
      if (!attendee.paymentId) {
        throw new FailedPreconditionError(`Attendee(ID=${attendeeId}) has no payment to cancel`)
      }

      const payment = await paymentService.getById(attendee.paymentId)
      if (payment.status === "PAID") {
        await paymentService.refund(attendee.paymentId)
      } else if (payment.status === "RESERVED" || payment.status === "UNPAID") {
        await paymentService.cancel(attendee.paymentId)
      } else {
        throw new FailedPreconditionError(`Attendee(ID=${attendeeId}) has not paid`)
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
        throw new NotFoundError(`Attendance for Payment(ID=${paymentId}) not found`)
      }
      const attendee = attendance.attendees.find((attendee) => attendee.paymentId === paymentId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee for Payment(ID=${paymentId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.paymentReservedAt || !attendee.paymentDeadline) {
        return
      }

      const payment = await paymentService.getById(paymentId)
      if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
        throw new IllegalStateError(`Got webhook about Payment(ID=${payment.id}) but API does not say so`)
      }

      await attendanceRepository.updateAttendeePaymentById(handle, attendee.id, {
        paymentReservedAt: getCurrentUTC(),
        paymentChargedAt: payment.status === "PAID" ? getCurrentUTC() : null,
        paymentDeadline: null,
        paymentLink: null,
      })
    },
    async executeVerifyPaymentTask(handle, { attendeeId }) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const event = await eventService.getByAttendance(handle, attendance.id)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.paymentId === null || attendee.paymentReservedAt) {
        return
      }

      const payment = await paymentService.getById(attendee.paymentId)

      // Based on whether the deadline has passed, we either kick them off the event, or suspend them indefinitely
      if (payment.status === "UNPAID" && isPast(attendance.deregisterDeadline)) {
        const mark = await markService.createMark(
          handle,
          {
            details: `Suspensjon for å ikke betale for arrangement ${event.title}`,
            // We do not have a method for indefinite duration yet.
            duration: 100_000,
            title: "Suspensjon for mangelende betaling",
            type: "MISSING_PAYMENT",
            // Immediate suspension
            weight: 6,
          },
          event.hostingGroups.map((g) => g.slug)
        )
        await personalMarkService.addToUser(handle, attendee.userId, mark.id)
        logger.info(
          "Suspended User(ID=％s) for missing payment for Event(ID=%s,Title=%s) with deregister deadline %s",
          attendee.userId,
          event.id,
          event.title,
          attendance.deregisterDeadline
        )
      } else if (payment.status === "UNPAID" || payment.status === "CANCELLED") {
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
      const previousTask = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, feedbackFormId)

      if (previousTask?.status === "COMPLETED") {
        throw new Error("executeVerifyFeedbackAnsweredTask tried to run after already having completed")
      }

      const feedbackForm = await feedbackFormService.getById(handle, feedbackFormId)

      if (!isPast(feedbackForm.answerDeadline)) {
        throw new Error("executeVerifyFeedbackAnsweredTask tried to run before answerDeadline on feedback form passed")
      }

      const attendance = await attendanceRepository.findAttendanceByEventId(handle, feedbackForm.eventId)
      const attendees = attendance?.attendees ?? []

      if (attendees.length === 0) {
        return
      }

      const attendedAttendees = attendees.filter((attendee) => Boolean(attendee.attendedAt))

      const event = await eventService.getEventById(handle, feedbackForm.eventId)

      if (!isPast(event.end)) {
        throw new Error("executeVerifyFeedbackAnsweredTask tried to run before end on event passed")
      }

      const answers = await feedbackAnswerService.getAllAnswers(handle, feedbackForm.id)

      const attendeesWithoutAnswers = attendedAttendees.filter(
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

      const personalMarkPromises = attendeesWithoutAnswers.map(async (attendee) =>
        personalMarkService.addToUser(handle, attendee.user.id, mark.id)
      )

      await Promise.all([...personalMarkPromises])
    },
    async executeSendFeedbackFormLinkEmails(handle) {
      const eventsEndedYesterday = await eventService.findEvents(handle, {
        byHasFeedbackForm: true,
        byEndDate: {
          min: new TZDate(startOfYesterday()),
          max: new TZDate(endOfYesterday()),
        },
      })

      const promises = eventsEndedYesterday.map(async (event) => {
        if (!event.attendanceId) {
          return
        }

        const feedbackForm = await feedbackFormService.findByEventId(handle, event.id)
        if (!feedbackForm || !feedbackForm.isActive) {
          return
        }

        const attendance = await this.getAttendanceById(handle, event.attendanceId)

        const attendees = attendance.attendees
        const attendedAttendees = attendees.filter((attendee) => Boolean(attendee.attendedAt))

        const answers = await feedbackAnswerService.getAllAnswers(handle, feedbackForm.id)

        const attendeesWithoutAnswers = attendedAttendees.filter(
          (attendee) => !answers.some((answer) => answer.attendeeId === attendee.id)
        )
        const bcc = attendeesWithoutAnswers.map((a) => a.user.email).filter((email) => email !== null)

        if (bcc.length === 0) {
          return
        }

        const validGroupTypes: GroupType[] = ["COMMITTEE", "NODE_COMMITTEE"]

        const hostingGroupEmail =
          event.hostingGroups.filter((group) => group.email && validGroupTypes.includes(group.type)).at(0)?.email ??
          "bedkom@online.ntnu.no"

        logger.info(
          "Sending feedback form email for Event(ID=%s) to %d attendees from email %s",
          event.id,
          bcc.length,
          hostingGroupEmail
        )

        await emailService.send(
          hostingGroupEmail,
          [],
          [],
          [],
          bcc,
          `Tilbakemelding på ${event.title}`,
          emails.FEEDBACK_FORM_LINK,
          {
            eventName: event.title,
            eventLink: `${configuration.WEB_PUBLIC_ORIGIN}/arrangementer/${slugify(event.title)}/${event.id}`,
            feedbackLink: `${configuration.WEB_PUBLIC_ORIGIN}/tilbakemelding/${event.id}`,
            eventStart: event.start.toISOString(),
            feedbackDeadline: feedbackForm.answerDeadline.toISOString(),
            organizerEmail: hostingGroupEmail,
          }
        )
      })

      await Promise.all(promises)
    },
    async registerAttendance(handle, attendeeId, at = getCurrentUTC()) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
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
    async scheduleMergeEventPoolsTask(handle, attendanceId, mergeTime) {
      await taskSchedulingService.scheduleAt(handle, tasks.MERGE_ATTENDANCE_POOLS, { attendanceId }, mergeTime)
    },
    async rescheduleMergeEventPoolsTask(handle, attendanceId, mergeTime) {
      const existingTask = await taskSchedulingService.findMergeEventPoolsTask(handle, attendanceId)

      if (existingTask?.scheduledAt === mergeTime) {
        return
      }

      if (existingTask) {
        await taskSchedulingService.cancel(handle, existingTask.id)
      }

      if (mergeTime === null) {
        return
      }

      await taskSchedulingService.scheduleAt(handle, tasks.MERGE_ATTENDANCE_POOLS, { attendanceId }, mergeTime)
    },
    async executeMergeEventPoolsTask(handle, { attendanceId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)

      const isMergeable = (pool: AttendancePool) => {
        if (pool.mergeDelayHours === null || pool.mergeDelayHours <= 0) {
          return true
        }

        const mergeTime = new TZDate(addHours(attendance.registerStart, pool.mergeDelayHours))
        return !isFuture(mergeTime)
      }

      // TODO: Maybe use a utility for partitioning the pools rather than two filters?
      // A pending pool is one that is not yet mergeable, in other words; it has not yet passed the merge delay hours
      // from registration start.
      const mergeablePools = attendance.pools.filter((pool) => isMergeable(pool))
      const pendingPools = attendance.pools.filter((pool) => !isMergeable(pool))

      if (mergeablePools.length <= 1) {
        console.log(`Only ${mergeablePools.length} pools to merge`)
        return
      }

      // We compute the next properties by summing up for all the pools. The next pool should not have a merge delay
      // since a potential pending pool should be merged into it.
      const defaultMergePool = {
        title: "Gruppe",
        mergeDelayHours: null,
        capacity: 0,
        yearCriteria: [] as number[],
      } satisfies AttendancePoolWrite

      const input = mergeablePools.reduce((acc, curr) => {
        const newYearCriteria = acc.yearCriteria.concat(...curr.yearCriteria)
        return {
          title: createPoolName(newYearCriteria),
          mergeDelayHours: acc.mergeDelayHours,
          capacity: acc.capacity + curr.capacity,
          yearCriteria: newYearCriteria,
        }
      }, defaultMergePool)

      validateAttendancePoolWrite(input)
      validateAttendancePoolDisjunction(input.yearCriteria, pendingPools)

      const pool = await attendanceRepository.createAttendancePool(handle, attendanceId, input)
      const mergeablePoolIds = mergeablePools.map((pool) => pool.id)

      await attendanceRepository.updateAttendeeAttendancePoolIdByAttendancePoolIds(handle, mergeablePoolIds, pool.id)
      await attendanceRepository.deleteAttendancePoolsByIds(handle, mergeablePoolIds)
      await this.updateAttendanceById(handle, attendanceId, { lastCompletedPoolsMergeAt: new Date() })
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
    throw new InvalidArgumentError("Cannot specify registration end before start")
  }
  if (Math.abs(differenceInHours(data.registerStart, data.registerEnd)) < 1) {
    throw new InvalidArgumentError("Registration time must be at least one hour long")
  }
}

function validateAttendancePoolWrite(data: AttendancePoolWrite) {
  if (data.mergeDelayHours !== null && (data.mergeDelayHours < 0 || data.mergeDelayHours > 48)) {
    throw new InvalidArgumentError("Merge delay for pool must be between 0 and 48 hours")
  }
  if (data.capacity < 0) {
    throw new InvalidArgumentError("Capacity for pool must be zero or positive")
  }
  if (data.yearCriteria.some((v) => v < 1 || v > 5)) {
    throw new InvalidArgumentError("Year criteria must be between 1 and 5")
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
    throw new InvalidArgumentError("Planned years overlap with existing constrains defined in existing pools")
  }
}

function validateAttendeeWrite(data: AttendeeWrite) {
  // This is mostly a sanity check
  if (data.userGrade !== null && (data.userGrade > 5 || data.userGrade < 1)) {
    throw new InvalidArgumentError("User grade must be between 1 and 5")
  }
}
