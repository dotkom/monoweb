import type { EventEmitter } from "node:events"
import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { type Logger, getLogger } from "@dotkomonline/logger"
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
  type Membership,
  type TaskId,
  type User,
  type UserId,
  findActiveMembership,
  getMembershipGrade,
  isAttendable,
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
  overriddenAttendancePoolId: AttendancePoolId | null
}

type EventDeregistrationOptions = {
  ignoreDeregistrationWindow: boolean
}

/** Different types of problems that prevent a user from registering for an event */
export type RegistrationRejectionCause = keyof typeof RegistrationRejectionCause
export const RegistrationRejectionCause = {
  SUSPENDED: "SUSPENDED",
  TOO_EARLY: "TOO_EARLY",
  TOO_LATE: "TOO_LATE",
  ALREADY_REGISTERED: "ALREADY_REGISTERED",
  MISSING_PARENT_REGISTRATION: "MISSING_PARENT_REGISTRATION",
  MISSING_PARENT_RESERVATION: "MISSING_PARENT_RESERVATION",
  MISSING_MEMBERSHIP: "MISSING_MEMBERSHIP",
  NO_MATCHING_POOL: "NO_MATCHING_POOL",
} as const

export type RegistrationBypassCause = keyof typeof RegistrationBypassCause
export const RegistrationBypassCause = {
  IGNORE_PARENT: "IGNORE_PARENT",
  IGNORE_REGISTRATION_START: "IGNORE_REGISTRATION_START",
  IGNORE_REGISTRATION_END: "IGNORE_REGISTRATION_END",
  OVERRIDDEN_POOL: "OVERRIDDEN_POOL",
} as const

/**
 * Discovered registration availability for a user
 *
 * A user is either permitted to attend an event at a given point in time, or they are rejected with a corresponding
 * cause description.
 *
 * For performance reasons, this result type also contains the three relations queried from the database, as well as
 * the AttendancePool object that matches the request.
 *
 * NOTE: This type should ONLY EVER be constructed from the `getRegistrationAvailability` function on the
 * AttendanceService!
 */
export type RegistrationAvailabilityResult = RegistrationAvailabilitySuccess | RegistrationAvailabilityFailure
export type RegistrationAvailabilitySuccess = {
  /**
   * The point in time where a reservation could be made for the user. Users of this result should use this point
   * in time for determining when to set `reserved = true` for the user.
   */
  reservationActiveAt: TZDate
  event: Event
  attendance: Attendance
  user: User
  membership: Membership
  /** The AttendancePool the user will be placed into based on the EventRegistrationOptions passed */
  pool: AttendancePool
  bypassedChecks: RegistrationBypassCause[]
  options: EventRegistrationOptions
  success: true
}
export type RegistrationAvailabilityFailure = { cause: RegistrationRejectionCause; success: false }

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
  getRegistrationAvailability(
    handle: DBHandle,
    attendaceId: AttendanceId,
    user: UserId,
    options: EventRegistrationOptions
  ): Promise<RegistrationAvailabilityResult>
  /**
   * Attempt to register an attendee for an event.
   *
   * NOTE: This function only does potential scheduling of associated tasks and other direct writes. The business
   * logic for checking attendance requirements are given by `getRegistrationAvailability`
   */
  registerAttendee(handle: DBHandle, availability: RegistrationAvailabilitySuccess): Promise<Attendee>
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
  executeVerifyAttendeeAttendedTask(handle: DBHandle): Promise<void>

  /**
   * Register that an attendee has physically attended an event.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendee}.
   */
  registerAttendance(handle: DBHandle, attendee: AttendeeId, at: TZDate | null): Promise<void>
  scheduleMergeEventPoolsTask(handle: DBHandle, attendanceId: AttendanceId, mergeTime: TZDate): Promise<TaskId | null>
  rescheduleMergeEventPoolsTask(
    handle: DBHandle,
    attendanceId: AttendanceId,
    existingTaskId: TaskId | null,
    mergeTime: TZDate | null
  ): Promise<TaskId | null>
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

      let taskId: TaskId | null = null

      // There is no reason to create a task if there is no merge delay
      if (data.mergeDelayHours) {
        const mergeTime = new TZDate(addHours(attendance.registerStart, data.mergeDelayHours))

        taskId = await this.scheduleMergeEventPoolsTask(handle, attendanceId, mergeTime)
      }

      return await attendanceRepository.createAttendancePool(handle, attendanceId, taskId, data)
    },
    async updateAttendancePool(handle, attendancePoolId, data) {
      validateAttendancePoolWrite(data)
      const attendance = await this.getAttendanceByPoolId(handle, attendancePoolId)
      const pool = attendance.pools.find((pool) => pool.id === attendancePoolId)

      if (!pool) {
        throw new NotFoundError(`AttendancePool(ID=${attendancePoolId}) not found`)
      }

      // Validate that the updated pool would not overlap with any other existing pools
      const otherPools = attendance.pools.filter((pool) => pool.id !== attendancePoolId)
      validateAttendancePoolDisjunction(data.yearCriteria, otherPools)

      const mergeTime = data.mergeDelayHours
        ? new TZDate(addHours(attendance.registerStart, data.mergeDelayHours))
        : null

      // Update any existing tasks related to the pool
      const taskId = await this.rescheduleMergeEventPoolsTask(handle, attendance.id, pool.taskId, mergeTime)

      return await attendanceRepository.updateAttendancePoolById(handle, attendancePoolId, taskId, data)
    },
    async deleteAttendancePool(handle, attendancePoolId) {
      await attendanceRepository.deleteAttendancePoolById(handle, attendancePoolId)
    },
    async getRegistrationAvailability(handle, attendanceId, userId, options) {
      // NOTE: There are a few optimizations on queries in this function, as we want to keep the performance if this
      // procedure high. In order to achieve this, we try to fetch as much data as possible in parallel, and we reduce
      // the number of queries based on checks needed.
      //
      // For example, we do not need to query the parent event if the `options` tell to ignore any constraints on the
      // parent event.
      const [attendance, event, user] = await Promise.all([
        this.getAttendanceById(handle, attendanceId),
        eventService.getByAttendanceId(handle, attendanceId),
        userService.getById(handle, userId),
      ])

      // A registration might be allowed to bypass a number of checks based on the provided options object. We
      // accumulate these in a list such that downstream users of the result can make decisions based on checks
      // skipped.
      const bypassedChecks: RegistrationBypassCause[] = []

      const isPreviouslyRegistered = attendance.attendees.some((a) => a.userId === userId)
      if (isPreviouslyRegistered) {
        return { cause: "ALREADY_REGISTERED", success: false }
      }

      if (isFuture(attendance.registerStart)) {
        if (!options.ignoreRegistrationWindow) {
          return { cause: "TOO_EARLY", success: false }
        }
        bypassedChecks.push("IGNORE_REGISTRATION_START")
      }

      if (isPast(attendance.registerEnd)) {
        if (!options.ignoreRegistrationWindow) {
          return { cause: "TOO_LATE", success: false }
        }
        bypassedChecks.push("IGNORE_REGISTRATION_END")
      }

      // PERF: We only query and check parent relationship when bypassing is not required.
      if (event.parentId !== null) {
        if (options.ignoreRegisteredToParent) {
          bypassedChecks.push("IGNORE_PARENT")
        } else {
          const parent = await attendanceRepository.findAttendanceByEventId(handle, event.parentId)
          // SAFETY: This cannot fail as its enforced on database level through a foreign key
          invariant(parent !== null)

          const attendee = parent.attendees.find((a) => a.userId === userId)
          if (attendee === undefined) {
            return { cause: "MISSING_PARENT_REGISTRATION", success: false }
          }
          if (!attendee.reserved) {
            return { cause: "MISSING_PARENT_RESERVATION", success: false }
          }
        }
      }

      const membership = findActiveMembership(user)
      if (membership === null) {
        return { cause: "MISSING_MEMBERSHIP", success: false }
      }

      // This is a "free" check that does zero roundtrips against the database, despite having a rather large piece of
      // code associated with it.
      let applicablePool: AttendancePool | null = null
      if (options.overriddenAttendancePoolId !== null) {
        const pool = attendance.pools.find((p) => p.id === options.overriddenAttendancePoolId)
        if (pool === undefined) {
          // If this ever happens, there is either a malformed request by a third-party client, or a bug in the web or
          // dashboard code.
          logger.warn(
            "User(ID=%s) attempted to override attendance on Event(ID=%s, Title=%s) with AttendancePool(ID=%s) but no such pool was found.",
            userId,
            event.id,
            event.title,
            options.overriddenAttendancePoolId
          )
          // TODO: Maybe this should just be an invariant?
          return { cause: "NO_MATCHING_POOL", success: false }
        }
        applicablePool = pool
        bypassedChecks.push("OVERRIDDEN_POOL")
      } else {
        applicablePool = attendance.pools.find((p) => isAttendable(user, p)) ?? null
      }

      if (applicablePool === null) {
        return { cause: "NO_MATCHING_POOL", success: false }
      }

      // PERF: This always has to be queried at this point, so for this reason, this query comes relatively late in
      // the sequence of checks we perform. It is better to reject users earlier so that this check does not need to
      // always run.
      const punishment = await personalMarkService.findPunishmentByUserId(handle, userId)
      if (punishment?.suspended === true) {
        return { cause: "SUSPENDED", success: false }
      }

      let reservationActiveAt = getCurrentUTC()
      if (applicablePool.mergeDelayHours !== null) {
        reservationActiveAt = addHours(reservationActiveAt, applicablePool.mergeDelayHours)
      }
      if (punishment !== null) {
        reservationActiveAt = addHours(reservationActiveAt, punishment.delay)
      }

      return {
        reservationActiveAt,
        event,
        attendance,
        user,
        pool: applicablePool,
        bypassedChecks,
        membership,
        options,
        success: true,
      }
    },
    async registerAttendee(
      handle,
      { user, event, attendance, pool, reservationActiveAt, bypassedChecks, membership, options, success }
    ) {
      // Since the user is permitted to attend the event (as the input result is a success), we output some debug
      // diagnostics based on any potential checks passed. This is done in this function as to not pollute logs when a
      // user simply checks their event availability.
      emitRegistrationAvailabilityDiagnostics(logger, {
        user,
        event,
        pool,
        bypassedChecks,
        attendance,
        reservationActiveAt,
        membership,
        options,
        success,
      })

      const poolAttendees = attendance.attendees.filter((a) => a.attendancePoolId === pool.id && a.reserved)
      const isImmediateReservation =
        (!isFuture(reservationActiveAt) && (pool.capacity === 0 || poolAttendees.length < pool.capacity)) ||
        options.immediateReservation
      const attendee = await attendanceRepository.createAttendee(
        handle,
        attendance.id,
        pool.id,
        user.id,
        AttendeeWriteSchema.parse({
          attendedAt: null,
          earliestReservationAt: reservationActiveAt,
          reserved: isImmediateReservation,
          selections: [],
          userGrade: getMembershipGrade(membership),
        } satisfies AttendeeWrite)
      )

      if (attendance.attendancePrice !== null && attendance.attendancePrice !== 0) {
        const paymentDeadline = options.immediatePayment ? addHours(getCurrentUTC(), 1) : addHours(getCurrentUTC(), 24)
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
      if (isImmediateReservation) {
        sendEventRegistrationEmail(event, attendance, attendee)
      } else {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.RESERVE_ATTENDEE,
          {
            attendeeId: attendee.id,
            attendanceId: attendance.id,
          },
          reservationActiveAt
        )
      }

      eventEmitter.emit("attendance:register-change", { attendee, status: "registered" })
      logger.info(
        "Attendee(ID=%s,UserID=%s) named %s has registered (effective %s) for Event(ID=%s) named %s with options: %o",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        reservationActiveAt,
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
      const event = await eventService.getByAttendanceId(handle, attendance.id)
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
      const event = await eventService.getByAttendanceId(handle, attendance.id)

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
      const event = await eventService.getByAttendanceId(handle, attendance.id)

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
      const event = await eventService.getByAttendanceId(handle, attendance.id)
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
    async executeVerifyAttendeeAttendedTask(handle) {
      const eventsEndedYesterday = await eventService.findEvents(handle, {
        byEndDate: {
          min: new TZDate(startOfYesterday()),
          max: new TZDate(endOfYesterday()),
        },
      })

      const errors: Error[] = []

      for (const event of eventsEndedYesterday) {
        if (!event.attendanceId) {
          return
        }

        try {
          const attendance = await this.getAttendanceById(handle, event.attendanceId)
          const attendeesNotAttended = attendance.attendees.filter(
            (attendee) => attendee.reserved && !attendee.attendedAt
          )

          if (attendeesNotAttended.length === 0) {
            continue
          }

          const mark = await markService.createMark(
            handle,
            {
              title: `Manglende oppmøte på ${event.title}`,
              duration: DEFAULT_MARK_DURATION,
              type: "MISSED_ATTENDANCE",
              weight: 3,
              details: null,
            },
            event.hostingGroups.map((group) => group.slug)
          )

          await Promise.all(
            attendeesNotAttended.map((attendee) => personalMarkService.addToUser(handle, attendee.user.id, mark.id))
          )
        } catch (e) {
          logger.error("Received error when attempting to create marks: %o", e)
          if (e instanceof Error) {
            errors.push(e)
          }
        }
      }

      if (errors.length !== 0) {
        throw new AggregateError(errors, "Failed to give marks to one or more attendees")
      }
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
      return await taskSchedulingService.scheduleAt(handle, tasks.MERGE_ATTENDANCE_POOLS, { attendanceId }, mergeTime)
    },
    async rescheduleMergeEventPoolsTask(handle, attendanceId, existingTaskId, mergeTime) {
      if (existingTaskId) {
        await taskSchedulingService.cancel(handle, existingTaskId)
      }

      if (mergeTime === null) {
        return null
      }

      return await this.scheduleMergeEventPoolsTask(handle, attendanceId, mergeTime)
    },
    async executeMergeEventPoolsTask(handle, { attendanceId }) {
      const attendance = await this.getAttendanceById(handle, attendanceId)

      const isMergeable = (pool: AttendancePool) => {
        if (pool.mergeDelayHours === null || pool.mergeDelayHours <= 0) {
          return true
        }

        const mergeTime = addHours(new TZDate(attendance.registerStart), pool.mergeDelayHours)
        return !isFuture(mergeTime)
      }

      // TODO: Maybe use a utility for partitioning the pools rather than two filters?
      // A pending pool is one that is not yet mergeable, in other words; it has not yet passed the merge delay hours
      // from registration start.
      const mergeablePools = attendance.pools.filter((pool) => isMergeable(pool))
      const pendingPools = attendance.pools.filter((pool) => !isMergeable(pool))

      if (mergeablePools.length <= 1) {
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

      const pool = await attendanceRepository.createAttendancePool(handle, attendanceId, null, input)
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

function emitRegistrationAvailabilityDiagnostics(
  logger: Logger,
  { user, event, pool, bypassedChecks }: RegistrationAvailabilitySuccess
) {
  diag: for (const check in bypassedChecks) {
    switch (check) {
      case "IGNORE_PARENT":
        logger.info(
          "Registration to Event(ID=%s, Title=%s) for User(ID=%s, Name=%s) is permitted to ignore parent event requirements",
          event.id,
          event.title,
          user.id,
          user.name
        )
        continue diag
      case "IGNORE_REGISTRATION_START":
        logger.info(
          "Registration to Event(ID=%s, Title=%s) for User(ID=%s, Name=%s) is permitted to ignore registration start requirement",
          event.id,
          event.title,
          user.id,
          user.name
        )
        continue diag
      case "IGNORE_REGISTRATION_END":
        logger.info(
          "Registration to Event(ID=%s, Title=%s) for User(ID=%s, Name=%s) is permitted to ignore registration end requirement",
          event.id,
          event.title,
          user.id,
          user.name
        )
        continue diag
      case "OVERRIDDEN_POOL":
        logger.info(
          "Registration to Event(ID=%s, Title=%s) for User(ID=%s, Name=%s) has chosen AttendancePool(ID=%s) as overriden attendance pool",
          event.id,
          event.title,
          user.id,
          user.name,
          pool.id
        )
        continue diag
    }
  }
}
