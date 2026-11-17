import { TZDate } from "@date-fns/tz"
import type { DBClient, DBHandle } from "@dotkomonline/db"
import { type Logger, getLogger } from "@dotkomonline/logger"
import {
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceSelection,
  type AttendanceSummary,
  type AttendanceWrite,
  AttendanceWriteSchema,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  AttendeeWriteSchema,
  DEREGISTER_GRACE_PERIOD_CLOCK_SKEW_MS,
  DEREGISTER_GRACE_PERIOD_MS,
  MAX_MERGE_DELAY_HOURS,
  type RegisterChangeEvent,
  type RegistrationAvailabilityView,
  type RegistrationRejectionCause,
  type RegistrationUserCause,
  type RegistrationWindowCause,
  buildPoolOccupancies,
  buildRegistrationAvailabilityCompletionView,
  getAttendeeQueuePosition,
  getMissingAttendanceCompletionRequirements,
  getRegisteredAttendeeCount,
  getRegistrationDeadline,
  isAttendable,
  isAttendeeChargedAndUnrefunded,
} from "./attendance"
import {
  createAbsoluteEventPageUrl,
  createCalendarEvent,
  createIcsBody,
  createPoolName,
  formatEmailSubject,
  getCurrentUTC,
  getStudyGrade,
  slugify,
} from "@dotkomonline/utils"
import {
  addDays,
  addHours,
  addMilliseconds,
  compareAsc,
  differenceInHours,
  endOfYesterday,
  isAfter,
  isBefore,
  isFuture,
  isPast,
  max,
  min,
  startOfYesterday,
} from "date-fns"
import type { EventEmitter } from "node:events"
import invariant from "tiny-invariant"
import { z } from "zod"
import type { Configuration } from "../../configuration"
import {
  FailedPreconditionError,
  IllegalStateError,
  InvalidArgumentError,
  NotFoundError,
  ResourceExhaustedError,
  TaskSkippedError,
} from "../../error"
import { validateTurnstileToken } from "../../turnstile"
import type { EmailAttachment, EmailService } from "../email/email-service"
import { DEFAULT_EMAIL_FROM_EMAIL_ADDRESS, emails, getReplyToAddresses } from "../email/email-template"
import type { FeedbackFormAnswerService } from "../feedback-form/feedback-form-answer-service"
import type { FeedbackFormService } from "../feedback-form/feedback-form-service"
import { getGroupDisplayName } from "../group/group"
import {
  DEFAULT_MARK_DURATION,
  INDEFINITE_SUSPENSION_DURATION,
  type Punishment,
  SUSPENSION_MARK_WEIGHT,
} from "../mark/mark"
import type { MarkService } from "../mark/mark-service"
import type { PersonalMarkService } from "../mark/personal-mark-service"
import type { PaymentView } from "../payment/payment"
import type { AttendancePaymentService } from "./attendance-payment-service"
import type { TaskId } from "../task/task"
import {
  type ChargeAttendeeTaskDefinition,
  type InferTaskData,
  type MergeAttendancePoolsTaskDefinition,
  type ReserveAttendeeTaskDefinition,
  type VerifyFeedbackAnsweredTaskDefinition,
  type VerifyAttendanceCompletionTaskDefinition,
  tasks,
} from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import { type Membership, type User, type UserId, findActiveMembership } from "../user/user"
import type { UserService } from "../user/user-service"

import type { AttendanceRepository } from "./attendance-repository"
import { type Event, findFirstHostingGroupEmail } from "./event"
import type { EventService } from "./event-service"

type EventRegistrationOptions = {
  /** Should the user be registered regardless of if registration is closed? */
  ignoreRegistrationWindow: boolean
  /** Should the user be registered to the event regardless of if they are registered to the parent event? */
  ignoreRegisteredToParent: boolean
  /** Should the user be immediately reserved? */
  immediateReservation: boolean
  /**
   * Should the payment be scheduled with an immediate deadline? If not, a 24-hour window is given.
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
  /**
   * Should the turnstile check be disabled in the backend? Should only be set to true if you are calling
   * registerAttendee as a system administrator.
   */
  overrideTurnstileCheck: boolean
}

type EventDeregistrationOptions = {
  ignoreDeregistrationWindow: boolean
  automaticDeregistrationReason?: {
    title: string
    details: string | null
  }
}

export type { RegistrationRejectionCause, RegistrationUserCause, RegistrationWindowCause } from "./attendance"

export type RegistrationBypassCause = keyof typeof RegistrationBypassCause
export const RegistrationBypassCause = {
  IGNORE_PARENT: "IGNORE_PARENT",
  IGNORE_REGISTRATION_START: "IGNORE_REGISTRATION_START",
  IGNORE_REGISTRATION_END: "IGNORE_REGISTRATION_END",
  IGNORE_MEMBERSHIP: "IGNORE_MEMBERSHIP",
  OVERRIDDEN_POOL: "OVERRIDDEN_POOL",
  OVERRIDDEN_TURNSTILE_CHECK: "OVERRIDDEN_TURNSTILE_CHECK",
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
   * in time for determining when the user can be given a seat.
   */
  reservationActiveAt: TZDate
  registrationPoolDelayHours: number | null
  registrationMarkDelayHours: number | null
  event: Event
  attendance: Attendance
  user: User
  membership: Membership | null
  /** The AttendancePool the user will be placed into based on the EventRegistrationOptions passed */
  pool: AttendancePool
  bypassedChecks: RegistrationBypassCause[]
  options: EventRegistrationOptions
  success: true
}
export type RegistrationAvailabilityFailure =
  | {
      success: false
      eventCause: RegistrationWindowCause
      userCause: null
      pool: AttendancePool
      reservationActiveAt: TZDate
    }
  | {
      success: false
      eventCause: RegistrationWindowCause | null
      userCause: RegistrationUserCause
    }

export function getRegistrationAvailabilityFailureCause(
  result: RegistrationAvailabilityFailure
): RegistrationRejectionCause {
  if (result.eventCause !== null) {
    return result.eventCause
  }
  return result.userCause
}

function registrationAvailabilityFailure(
  eventCause: RegistrationWindowCause | null,
  userCause: RegistrationUserCause
): RegistrationAvailabilityFailure {
  if (eventCause === null) {
    return { success: false, eventCause: null, userCause }
  }
  return { success: false, eventCause, userCause }
}

/**
 * Service for managing attendance, attendance pools, and the attendees that are attending an event.
 *
 * The following describes in broad terms the terminology used, and how the service generally works:
 */
export interface AttendanceService {
  createAttendance(handle: DBHandle, data: AttendanceWrite): Promise<Attendance>
  deleteAttendance(handle: DBHandle, attendanceId: AttendanceId): Promise<void>
  findAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance | null>
  findAttendanceByPoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<Attendance | null>
  findAttendanceByAttendeeId(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendance | null>
  getAttendanceById(handle: DBHandle, attendanceId: AttendanceId): Promise<Attendance>
  getAttendancesByIds(handle: DBHandle, attendanceIds: AttendanceId[]): Promise<Attendance[]>
  getAttendanceSummariesByIds(
    handle: DBHandle,
    attendanceIds: AttendanceId[],
    userId?: UserId
  ): Promise<AttendanceSummary[]>
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
    attendanceId: AttendanceId,
    turnstileToken: string | null, // If null, overrideTurnstileCheck must be true
    userId: UserId,
    options: EventRegistrationOptions
  ): Promise<RegistrationAvailabilityResult>
  /**
   * Attempt to register an attendee for an event.
   *
   * NOTE: This function only does potential scheduling of associated tasks and other direct writes. The business
   * logic for checking attendance requirements are given by `getRegistrationAvailability`
   */
  registerAttendee(
    handle: DBHandle,
    availability: RegistrationAvailabilitySuccess,
    adminRegisteredByUserId?: UserId | null
  ): Promise<Attendee>
  getAttendeeById(handle: DBHandle, attendeeId: AttendeeId): Promise<Attendee>
  /**
   * Updates attendee details and handles payment creation or cancellation when registration changes.
   */
  updateAttendeeById(handle: DBHandle, attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<Attendee>
  executeReserveAttendeeTask(handle: DBHandle, task: InferTaskData<ReserveAttendeeTaskDefinition>): Promise<void>
  deregisterAttendee(handle: DBHandle, attendeeId: AttendeeId, options: EventDeregistrationOptions): Promise<void>
  findChargeAttendeeScheduleDate(handle: DBHandle, attendeeId: AttendeeId): Promise<Date | null>

  updateAttendancePaymentPrice(handle: DBHandle, attendanceId: AttendanceId, priceNok: number | null): Promise<void>
  deleteAttendancePayment(handle: DBHandle, attendance: Attendance): Promise<void>
  executeChargeAttendeeTask(handle: DBHandle, task: InferTaskData<ChargeAttendeeTaskDefinition>): Promise<void>
  openAttendeeCheckout(client: DBClient, attendeeId: AttendeeId): Promise<Attendee>
  prepareAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, completionDeadline: TZDate): Promise<PaymentView>
  cancelAttendeePayment(handle: DBHandle, attendeeId: AttendeeId, refundedByUserId: UserId): Promise<void>
  waiveAttendeePayment(
    handle: DBHandle,
    attendeeId: AttendeeId,
    waivedByUserId: UserId,
    reason: string | null
  ): Promise<void>
  /**
   * Sync the payment status of an attendee with the status of the payment in the payment service.
   * This used if payments are altered manually in the payment service's own dashboard.
   */
  syncAttendeePayment(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  createAttendeePaymentCharge(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  executeVerifyAttendanceCompletionTask(
    handle: DBHandle,
    task: InferTaskData<VerifyAttendanceCompletionTaskDefinition>
  ): Promise<void>
  executeVerifyFeedbackAnsweredTask(
    handle: DBHandle,
    task: InferTaskData<VerifyFeedbackAnsweredTaskDefinition>
  ): Promise<void>
  executeSendFeedbackFormLinkEmailsRecurringTask(handle: DBHandle): Promise<void>
  executeVerifyAttendeeAttendedTaskRecurringTask(handle: DBHandle): Promise<void>

  /**
   * Register that an attendee has physically attended an event.
   *
   * NOTE: Be careful of the difference between this and {@link registerAttendee}.
   */
  registerAttendance(handle: DBHandle, attendeeId: AttendeeId, registeredAt: TZDate | null): Promise<void>
  scheduleMergeEventPoolsTask(handle: DBHandle, attendanceId: AttendanceId, mergeTime: TZDate): Promise<TaskId | null>
  rescheduleMergeEventPoolsTask(
    handle: DBHandle,
    attendanceId: AttendanceId,
    existingTaskId: TaskId | null,
    mergeTime: TZDate | null
  ): Promise<TaskId | null>
  executeMergeEventPoolsTask(handle: DBHandle, task: InferTaskData<MergeAttendancePoolsTaskDefinition>): Promise<void>

  notifyAttendees(handle: DBHandle, attendanceId: AttendanceId, message: string, title: string): Promise<void>
}

export function getAttendanceService(
  eventEmitter: EventEmitter,
  attendanceRepository: AttendanceRepository,
  taskSchedulingService: TaskSchedulingService,
  userService: UserService,
  markService: MarkService,
  personalMarkService: PersonalMarkService,
  attendancePaymentService: AttendancePaymentService,
  eventService: EventService,
  feedbackFormService: FeedbackFormService,
  feedbackAnswerService: FeedbackFormAnswerService,
  configuration: Configuration,
  emailService: EmailService
): AttendanceService {
  const logger = getLogger("attendance-service")

  async function cancelPendingAttendeeCompletion(handle: DBHandle, attendeeId: AttendeeId): Promise<void> {
    const task = await taskSchedulingService.findVerifyAttendanceCompletionTask(handle, attendeeId)

    if (task === null || task.status !== "PENDING") {
      return
    }

    await taskSchedulingService.cancel(handle, task.id)
  }

  async function startAttendeeCompletionDeadline(
    handle: DBHandle,
    attendeeId: AttendeeId,
    completionDeadline: TZDate
  ): Promise<void> {
    await attendanceRepository.updateAttendeeCompletionDeadline(handle, attendeeId, completionDeadline)
    await taskSchedulingService.scheduleAt(
      handle,
      tasks.VERIFY_ATTENDANCE_COMPLETION,
      { attendeeId },
      completionDeadline
    )
  }

  async function clearAttendeeCompletionDeadline(handle: DBHandle, attendeeId: AttendeeId): Promise<void> {
    await cancelPendingAttendeeCompletion(handle, attendeeId)
    await attendanceRepository.updateAttendeeCompletionDeadline(handle, attendeeId, null)
  }

  async function broadcastPaymentChange(handle: DBHandle, attendance: Attendance, attendeeId: AttendeeId) {
    const attendee = await attendanceRepository.findAttendeeById(handle, attendeeId)

    if (attendee != null) {
      emitRegisterChange(eventEmitter, attendance, attendee, "updated")
    }
  }

  function sendQueueNotificationEmail(event: Event, position: number, attendee: Attendee) {
    if (attendee.user.email === null) {
      return
    }

    void emailService.send({
      replyTo: [DEFAULT_EMAIL_FROM_EMAIL_ADDRESS],
      to: [attendee.user.email],
      subject: formatEmailSubject(`Du har rykket frem i køen til ${event.title}`),
      definition: emails.QUEUE_NOTIFICATION,
      data: {
        eventName: event.title,
        eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
        eventImageUrl: event.imageUrl,
        position,
      },
    })
  }

  function getOrganizerEmails(event: Event): string[] {
    const organizerEmails = event.hostingGroups
      .map((group) => group.email)
      .filter((email): email is string => email !== null && z.email().safeParse(email).success)

    if (organizerEmails.length === 0) {
      organizerEmails.push("dotkom@online.ntnu.no")
    }

    return organizerEmails
  }

  function sendEventRegistrationEmail(event: Event, attendance: Attendance, attendee: Attendee) {
    if (attendee.user.email === null) {
      return
    }

    const organizerEmails = getOrganizerEmails(event)

    const calendarEvent = createCalendarEvent(event, configuration.WEB_PUBLIC_ORIGIN)
    const calendarBody = createIcsBody(calendarEvent)
    const calendarAttachment: EmailAttachment = {
      filename: `${slugify(event.title)}.ics`,
      contentType: "text/calendar; charset=utf-8",
      rawContent: Buffer.from(calendarBody).toString("base64"),
    }

    // NOTE: We do not await here, because we don't want to delay the response to the user for sending the email.
    // AWS SES can be slow to fulfill, and this is an asynchronous operation anyway.
    void emailService.send({
      replyTo: getReplyToAddresses(organizerEmails),
      to: [attendee.user.email],
      subject: formatEmailSubject(`Du er påmeldt ${event.title}`),
      definition: emails.EVENT_ATTENDANCE,
      data: {
        deregistrationDeadline: attendance.deregisterDeadline.toISOString(),
        eventName: event.title,
        eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
        eventImageUrl: event.imageUrl,
      },
      attachments: [calendarAttachment],
    })
  }

  function sendEventAutomaticDeregistrationEmail(
    event: Event,
    attendee: Attendee,
    reason: { title: string; details: string | null }
  ) {
    if (attendee.user.email === null) {
      return
    }

    const organizerEmails = getOrganizerEmails(event)

    void emailService.send({
      replyTo: getReplyToAddresses(organizerEmails),
      to: [attendee.user.email],
      subject: formatEmailSubject(`Du har blitt avmeldt ${event.title}`),
      definition: emails.EVENT_AUTOMATIC_DEREGISTRATION,
      data: {
        eventName: event.title,
        eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
        eventImageUrl: event.imageUrl,
        title: reason.title,
        details: reason.details,
        organizerEmail: organizerEmails[0] ?? DEFAULT_EMAIL_FROM_EMAIL_ADDRESS,
      },
    })
  }

  async function completePaymentRequirement(
    handle: DBHandle,
    attendance: Attendance,
    attendeeId: AttendeeId,
    payment: PaymentView
  ) {
    await clearAttendeeCompletionDeadline(handle, attendeeId)

    if (payment.status !== "AUTHORIZED") {
      return
    }

    const chargeTask = await taskSchedulingService.findChargeAttendeeTask(handle, attendeeId)

    const paymentAttemptId = payment.attemptId

    if (paymentAttemptId === null) {
      throw new IllegalStateError(`Payment(ID=${payment.id}) is authorized without a payment attempt`)
    }

    const scheduledPayload = tasks.CHARGE_ATTENDEE.getSchema().safeParse(chargeTask?.payload)
    const scheduledAttemptId = scheduledPayload.success ? scheduledPayload.data.paymentAttemptId : null
    const chargeDeadline = new TZDate(payment.captureScheduledAt ?? attendance.deregisterDeadline, "UTC")
    const scheduledChargeTime = max([getCurrentUTC(), chargeDeadline])

    if (chargeTask?.status === "PENDING" && scheduledAttemptId === paymentAttemptId) {
      if (chargeTask.scheduledAt == null || !isAfter(chargeTask.scheduledAt, scheduledChargeTime)) {
        return
      }

      await taskSchedulingService.cancel(handle, chargeTask.id)
    }

    await taskSchedulingService.scheduleAt(
      handle,
      tasks.CHARGE_ATTENDEE,
      { attendeeId, paymentAttemptId },
      scheduledChargeTime
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

    async getAttendanceSummariesByIds(handle, attendanceIds, userId) {
      return await attendanceRepository.findAttendanceSummariesByIds(handle, attendanceIds, userId)
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
            return {
              isAffected,
              selectionsForUpdate: attendeeSelectionsForUpdate,
              attendee,
            }
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

    async deleteAttendance(handle, attendanceId) {
      const attendance = await this.getAttendanceById(handle, attendanceId)

      if (attendance.pools.length > 0) {
        throw new FailedPreconditionError(`Cannot delete Attendance(ID=${attendanceId}) because it still has pools`)
      }

      await attendanceRepository.deleteAttendanceById(handle, attendanceId)
    },

    async getRegistrationAvailability(handle, attendanceId, turnstileToken, userId, options) {
      // NOTE: There are a few optimizations on queries in this function, as we want to keep the performance if this
      // procedure high. In order to achieve this, we try to fetch as much data as possible in parallel, and we reduce
      // the number of queries based on checks needed. For this reason, we also check the turnstile token validity
      // during the other initial queries, as this is also a check that can be done early and can potentially short
      // circuit the rest of the function if the token is invalid.
      //
      // For example, we do not need to query the parent event if the `options` tell to ignore any constraints on the
      // parent event.

      let eventCause: RegistrationWindowCause | null = null

      const turnstileCheckRunner = async (): Promise<boolean> => {
        if (!turnstileToken) {
          return false
        }

        const validationResponse = await validateTurnstileToken({
          token: turnstileToken,
          secretKey: configuration.TURNSTILE_SECRET_KEY,
          idempotencyKey: crypto.randomUUID(),
        })

        if (!validationResponse.success) {
          logger.warn(
            "Turnstile validation failed for User(ID=%s) registering for Attendance(ID=%s): %o",
            userId,
            attendanceId,
            validationResponse.error_codes
          )
          return false
        }

        return true
      }

      const [attendance, event, user, turnstileCheckResult] = await Promise.all([
        this.getAttendanceById(handle, attendanceId),
        eventService.getByAttendanceId(handle, attendanceId),
        userService.getById(handle, userId),
        turnstileCheckRunner(),
      ])

      // A registration might be allowed to bypass a number of checks based on the provided options object. We
      // accumulate these in a list such that downstream users of the result can make decisions based on checks
      // skipped.
      const bypassedChecks: RegistrationBypassCause[] = []

      if (!turnstileCheckResult) {
        if (!options.overrideTurnstileCheck) {
          return registrationAvailabilityFailure(eventCause, "INVALID_TURNSTILE_TOKEN")
        }
        bypassedChecks.push("OVERRIDDEN_TURNSTILE_CHECK")
      }

      const isPreviouslyRegistered = attendance.attendees.some((a) => a.userId === userId)
      if (isPreviouslyRegistered) {
        return registrationAvailabilityFailure(eventCause, "ALREADY_REGISTERED")
      }

      if (isFuture(attendance.registerStart)) {
        if (!options.ignoreRegistrationWindow) {
          eventCause = "TOO_EARLY"
        } else {
          bypassedChecks.push("IGNORE_REGISTRATION_START")
        }
      }

      if (isPast(attendance.registerEnd)) {
        if (!options.ignoreRegistrationWindow) {
          eventCause = "TOO_LATE"
        } else {
          bypassedChecks.push("IGNORE_REGISTRATION_END")
        }
      }

      // PERF: We only query and check parent relationship when bypassing is not required.
      if (event.parentId !== null) {
        if (options.ignoreRegisteredToParent) {
          bypassedChecks.push("IGNORE_PARENT")
        } else {
          // SAFETY: The event should always exist as it's enforced on database level through a foreign key
          const parentAttendance = await attendanceRepository.findAttendanceByEventId(handle, event.parentId)

          // We check that the event has an attendance
          if (parentAttendance !== null) {
            const attendee = parentAttendance.attendees.find((a) => a.userId === userId)

            if (attendee === undefined) {
              return registrationAvailabilityFailure(eventCause, "MISSING_PARENT_REGISTRATION")
            }

            if (attendee.registeredAt === null) {
              return registrationAvailabilityFailure(eventCause, "MISSING_PARENT_RESERVATION")
            }
          }
        }
      }

      const membership = findActiveMembership(user)

      if (membership === null) {
        if (options.overriddenAttendancePoolId === null) {
          return registrationAvailabilityFailure(eventCause, "MISSING_MEMBERSHIP")
        }

        bypassedChecks.push("IGNORE_MEMBERSHIP")
      }

      // This is a "free" check that does zero roundtrips against the database, despite having a rather large piece of
      // code associated with it.
      let applicablePool: AttendancePool | null = null
      if (options.overriddenAttendancePoolId !== null) {
        const pool = attendance.pools.find((p) => p.id === options.overriddenAttendancePoolId)

        if (pool === undefined) {
          // If this ever happens, there is either a malformed request by a third-party client, or a bug in the web or
          // admin code.
          logger.warn(
            "User(ID=%s) attempted to override attendance on Event(ID=%s, Title=%s) with AttendancePool(ID=%s) but no such pool was found.",
            userId,
            event.id,
            event.title,
            options.overriddenAttendancePoolId
          )

          // TODO: Maybe this should just be an invariant?
          return registrationAvailabilityFailure(eventCause, "NO_MATCHING_POOL")
        }

        applicablePool = pool
        bypassedChecks.push("OVERRIDDEN_POOL")
      } else {
        applicablePool = attendance.pools.find((p) => isAttendable(user, p)) ?? null
      }

      if (applicablePool === null) {
        return registrationAvailabilityFailure(eventCause, "NO_MATCHING_POOL")
      }

      // PERF: This always has to be queried at this point, so for this reason, this query comes relatively late in
      // the sequence of checks we perform. It is better to reject users earlier so that this check does not need to
      // always run.
      const punishment = await personalMarkService.findPunishmentByUserId(handle, userId)

      if (punishment?.suspended === true) {
        return registrationAvailabilityFailure(eventCause, "SUSPENDED")
      }

      let reservationActiveAt = getCurrentUTC()

      if (applicablePool.mergeDelayHours !== null) {
        reservationActiveAt = addHours(reservationActiveAt, applicablePool.mergeDelayHours)
      }

      if (punishment !== null) {
        reservationActiveAt = addHours(reservationActiveAt, punishment.delay)
      }

      const registrationDeadline = getRegistrationDeadline(
        attendance,
        applicablePool.mergeDelayHours,
        punishment?.delay ?? null
      )

      if (eventCause === null && isPast(registrationDeadline)) {
        if (!options.ignoreRegistrationWindow) {
          eventCause = "TOO_LATE"
        } else if (!bypassedChecks.includes("IGNORE_REGISTRATION_END")) {
          bypassedChecks.push("IGNORE_REGISTRATION_END")
        }
      }

      if (eventCause !== null) {
        return {
          success: false,
          eventCause,
          userCause: null,
          pool: applicablePool,
          reservationActiveAt,
        }
      }

      return {
        reservationActiveAt,
        registrationPoolDelayHours: applicablePool.mergeDelayHours,
        registrationMarkDelayHours: punishment?.delay ?? null,
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
      {
        user,
        event,
        attendance,
        pool,
        reservationActiveAt,
        bypassedChecks,
        membership,
        options,
        success,
        registrationPoolDelayHours,
        registrationMarkDelayHours,
      },
      adminRegisteredByUserId = null
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
        registrationPoolDelayHours,
        registrationMarkDelayHours,
      })

      const registeredPoolAttendees = attendance.attendees.filter(
        (attendee) => attendee.attendancePoolId === pool.id && attendee.registeredAt !== null
      )
      const isImmediateReservation =
        (!isFuture(reservationActiveAt) && (pool.capacity === 0 || registeredPoolAttendees.length < pool.capacity)) ||
        options.immediateReservation

      const userGrade = membership?.semester != null ? getStudyGrade(membership.semester) : null

      const attendee = await attendanceRepository.createAttendee(
        handle,
        attendance.id,
        pool.id,
        user.id,
        AttendeeWriteSchema.parse({
          adminRegisteredByUserId,
          attendedAt: null,
          registrationPoolDelayHours,
          registrationMarkDelayHours,
          registeredAt: isImmediateReservation ? getCurrentUTC() : null,
          selections: [],
          userGrade,
        } satisfies AttendeeWrite)
      )

      // Immediate reservations go through right away, otherwise we schedule a task to handle the reservation at the
      // appropriate time. In this case, the email is sent when the reservation becomes effective.
      if (isImmediateReservation) {
        if (attendance.attendancePrice !== null && attendance.attendancePrice > 0) {
          const completionDeadline = options.immediatePayment
            ? addHours(getCurrentUTC(), 1)
            : addHours(getCurrentUTC(), 24)

          const payment = await this.prepareAttendeePayment(handle, attendee.id, completionDeadline)

          attendee.completionDeadline = completionDeadline
          attendee.payment = payment

          logger.info(
            "Attendee(ID=%s,UserID=%s) has been given until %s UTC to complete attendance for Event(ID=%s) with Payment(ID=%s)",
            attendee.id,
            attendee.user.id,
            completionDeadline.toUTCString(),
            event.id,
            payment.id
          )
        }

        sendEventRegistrationEmail(event, attendance, attendee)
      } else {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.RESERVE_ATTENDEE,
          {
            attendeeId: attendee.id,
            attendanceId: attendance.id,
          },
          new TZDate(attendee.registrationEligibleAt)
        )
      }

      emitRegisterChange(eventEmitter, attendance, attendee, "registered")
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

      const isMovingToQueue = attendee.registeredAt !== null && input.registeredAt === null

      if (isMovingToQueue) {
        if (attendee.payment !== null) {
          await attendancePaymentService.cancel(handle, attendee.payment.id)
        }

        await clearAttendeeCompletionDeadline(handle, attendeeId)
        const chargeTask = await taskSchedulingService.findChargeAttendeeTask(handle, attendeeId)

        if (chargeTask?.status === "PENDING") {
          await taskSchedulingService.cancel(handle, chargeTask.id)
        }
      }

      const isReserving = data.registeredAt != null
      const needsPayment = attendee.registeredAt === null || attendee.payment === null
      const isPaidAttendance = attendance.attendancePrice !== null && attendance.attendancePrice > 0
      const updatedAttendee = await attendanceRepository.updateAttendeeById(handle, attendeeId, input)

      if (isReserving && needsPayment && isPaidAttendance) {
        const payment =
          attendee.payment === null ? null : await attendancePaymentService.syncPayment(handle, attendee.payment.id)

        if (payment === null || (!payment.isRequirementSatisfied && payment.canStartCheckout)) {
          const deadline = addHours(getCurrentUTC(), 24)
          updatedAttendee.payment = await this.prepareAttendeePayment(handle, attendeeId, deadline)
          updatedAttendee.completionDeadline = deadline
        } else {
          updatedAttendee.payment = payment
        }
      }

      if (data.registeredAt !== undefined) {
        emitRegisterChange(eventEmitter, attendance, updatedAttendee, "updated")
      }

      return updatedAttendee
    },

    async executeReserveAttendeeTask(handle, { attendanceId, attendeeId }) {
      const attendance = await this.findAttendanceById(handle, attendanceId)
      if (attendance === null) {
        throw new TaskSkippedError(`Attendance(ID=${attendanceId}) no longer exists`)
      }

      const event = await eventService.getByAttendanceId(handle, attendance.id)

      const attendee = attendance.attendees.find((a) => a.id === attendeeId)
      if (attendee === undefined) {
        throw new TaskSkippedError(`Attendee(ID=${attendeeId}) no longer exists in Attendance(ID=${attendanceId})`)
      }

      if (attendee.registeredAt !== null) {
        return
      }

      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      invariant(pool !== undefined)

      const registeredAdjacentAttendees = attendance.attendees.filter(
        (adjacentAttendee) => adjacentAttendee.attendancePoolId === pool.id && adjacentAttendee.registeredAt !== null
      )
      const isPoolAtMaxCapacity = pool.capacity !== 0 && registeredAdjacentAttendees.length >= pool.capacity
      const isFutureReservationTime = isFuture(attendee.registrationEligibleAt)

      if (isPoolAtMaxCapacity) {
        return
      }

      if (isFutureReservationTime) {
        logger.warn(
          "ReserveAttendee task for Attendee(ID=%s) ran before registrationEligibleAt %s.",
          attendee.id,
          attendee.registrationEligibleAt.toUTCString()
        )
      }

      const data = AttendeeWriteSchema.parse(attendee)
      data.registeredAt = getCurrentUTC()

      const updatedAttendee = await this.updateAttendeeById(handle, attendeeId, data)

      sendEventRegistrationEmail(event, attendance, updatedAttendee)
    },

    async deregisterAttendee(handle, attendeeId, options) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (isAttendeeChargedAndUnrefunded(attendee)) {
        throw new FailedPreconditionError(
          `Cannot deregister Attendee(ID=${attendeeId}) from Attendance(ID=${attendance.id}) because payment has been completed`
        )
      }

      // Queued attendees can deregister after the deadline because they do not hold a seat.
      if (
        attendee.registeredAt !== null &&
        isPast(attendance.deregisterDeadline) &&
        !options.ignoreDeregistrationWindow
      ) {
        throw new FailedPreconditionError(
          `Cannot deregister Attendee(ID=${attendeeId}) from Attendance(ID=${attendance.id}) after registration end`
        )
      }

      if (attendee.payment !== null) {
        await attendancePaymentService.cancel(handle, attendee.payment.id)
      }

      await attendanceRepository.deleteAttendeeById(handle, attendeeId)
      const event = await eventService.getByAttendanceId(handle, attendance.id)

      emitRegisterChange(eventEmitter, attendance, attendee, "deregistered")
      logger.info(
        "Attendee(ID=%s,UserID=%s) named %s has deregistered from Event(ID=%s) named %s with options: %o",
        attendee.id,
        attendee.user.id,
        attendee.user.name || "<missing name>",
        event.id,
        event.title,
        options
      )

      if (options.automaticDeregistrationReason !== undefined) {
        sendEventAutomaticDeregistrationEmail(event, attendee, options.automaticDeregistrationReason)
      }

      const pool = attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)
      invariant(pool !== undefined)

      // If the deregistered attendee wasn't registered, no spot was freed up, so no queue promotion is needed.
      if (attendee.registeredAt === null) {
        return
      }

      const remainingAttendees = attendance.attendees.filter((a) => a.id !== attendee.id)
      const registeredAttendeeCount = remainingAttendees.filter(
        (remainingAttendee) => remainingAttendee.registeredAt !== null && remainingAttendee.attendancePoolId === pool.id
      ).length

      // If the pool is at capacity, we cannot reserve anyone new
      if (pool.capacity !== 0 && (pool.capacity < 0 || registeredAttendeeCount >= pool.capacity)) {
        return
      }

      // We are now looking for a replacement for the attendee that just deregistered. The criteria that we need to
      // match are:
      //
      // 1. The attendee must be in the same pool as the deregistered attendee
      // 2. The attendee must not already be registered
      // 3. The attendee must have a reservation time not in the future
      const sortedQueue = remainingAttendees
        .filter((a) => a.attendancePoolId === pool.id)
        .filter((queuedAttendee) => queuedAttendee.registeredAt === null)
        .filter((queuedAttendee) => !isFuture(queuedAttendee.registrationEligibleAt))
        .toSorted((firstAttendee, secondAttendee) =>
          compareAsc(firstAttendee.registrationEligibleAt, secondAttendee.registrationEligibleAt)
        )

      const firstQueuedAdjacentAttendee = sortedQueue.at(0)

      if (firstQueuedAdjacentAttendee === undefined) {
        return
      }

      const promotedAttendee = await this.updateAttendeeById(handle, firstQueuedAdjacentAttendee.id, {
        registeredAt: getCurrentUTC(),
      })

      sendEventRegistrationEmail(event, attendance, promotedAttendee)

      for (const [index, queueAttendee] of sortedQueue.slice(1, 4).entries()) {
        sendQueueNotificationEmail(event, index + 1, queueAttendee)
      }
    },

    async findChargeAttendeeScheduleDate(handle, attendeeId) {
      const attendee = await this.getAttendeeById(handle, attendeeId)

      if (attendee.payment === null) {
        return null
      }

      const job = await taskSchedulingService.findChargeAttendeeTask(handle, attendeeId)

      if (job === null) {
        return null
      }

      return job.scheduledAt
    },

    async deleteAttendancePayment(handle, attendance: Attendance) {
      for (const attendee of attendance.attendees) {
        if (attendee.payment === null) {
          continue
        }

        const payment = await attendancePaymentService.syncPayment(handle, attendee.payment.id)

        if (
          !payment.canCancel &&
          (payment.status === "CANCELLED" ||
            payment.status === "EXPIRED" ||
            payment.status === "FAILED" ||
            payment.status === "UNPAID" ||
            payment.status === "REFUNDED" ||
            payment.status === "WAIVED")
        ) {
          continue
        }

        throw new ResourceExhaustedError(
          `Cannot delete payment for Attendance(ID=${attendance.id}) as Attendee(ID=${attendee.id}) has an active payment`
        )
      }

      const updatedAttendance = await attendanceRepository.updateAttendancePaymentPrice(handle, attendance.id, null)

      for (const attendee of updatedAttendance.attendees) {
        await clearAttendeeCompletionDeadline(handle, attendee.id)
      }

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

    async updateAttendancePaymentPrice(handle, attendanceId, priceNok) {
      if (priceNok !== null && priceNok < 0) {
        throw new InvalidArgumentError(
          `Tried to set negative price (${priceNok} NOK) for Attendance(ID=${attendanceId})`
        )
      }

      const attendance = await this.getAttendanceById(handle, attendanceId)

      if (priceNok === null || priceNok === 0) {
        await this.deleteAttendancePayment(handle, attendance)
      }

      await attendanceRepository.updateAttendancePaymentPrice(handle, attendanceId, priceNok)
    },

    async executeChargeAttendeeTask(handle, { attendeeId, paymentAttemptId }) {
      const attendance = await this.findAttendanceByAttendeeId(handle, attendeeId)

      if (attendance === null) {
        throw new TaskSkippedError(`Attendance for Attendee(ID=${attendeeId}) no longer exists`)
      }

      const attendee = attendance.attendees.find((candidate) => candidate.id === attendeeId)

      if (attendee === undefined) {
        throw new TaskSkippedError(`Attendee(ID=${attendeeId}) no longer exists in Attendance(ID=${attendance.id})`)
      }

      logger.info("Executing Stripe charge for Attendee(ID=%s) of Attendance(ID=%s)", attendee.id, attendance.id)

      if (attendee.payment?.attemptId !== paymentAttemptId) {
        throw new TaskSkippedError(`PaymentAttempt(ID=${paymentAttemptId}) is no longer the attendee's current attempt`)
      }

      await this.createAttendeePaymentCharge(handle, attendee.id)
    },

    async openAttendeeCheckout(client, attendeeId) {
      const attendee = await this.getAttendeeById(client, attendeeId)

      if (attendee.payment === null) {
        return attendee
      }

      try {
        attendee.payment = await attendancePaymentService.openCheckout(client, attendee.payment.id)
        await this.syncAttendeePayment(client, attendeeId)

        return await this.getAttendeeById(client, attendeeId)
      } catch (error) {
        // The persisted checkout task retries without rolling back the user's reservation.
        logger.error("Could not open checkout for Attendee(ID=%s); the checkout task will retry: %o", attendeeId, error)
      }

      return attendee
    },

    async prepareAttendeePayment(handle, attendeeId, completionDeadline): Promise<PaymentView> {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)

      if (attendance.attendancePrice === null || attendance.attendancePrice <= 0) {
        throw new Error("Tried to create a payment for an attendance without a price")
      }

      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.registeredAt === null) {
        throw new FailedPreconditionError("Cannot create a payment for an attendee who is still in the queue")
      }

      const event = await eventService.getByAttendanceId(handle, attendance.id)
      const isImmediatePayment = isPast(attendance.deregisterDeadline)

      // Capture before deregistration closes or the five-day hold limit, whichever comes first.
      const maximalChargeTime = min([addDays(getCurrentUTC(), 5), new TZDate(attendance.deregisterDeadline, "UTC")])
      const returnUrl = createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title)
      const payment = await attendancePaymentService.prepareCheckout(handle, {
        attendance,
        attendee,
        event,
        returnUrl,
        customerEmail: attendee.user.email,
        captureMode: isImmediatePayment ? "AUTOMATIC" : "MANUAL",
        captureScheduledAt: isImmediatePayment ? null : maximalChargeTime,
      })

      if (payment.isRequirementSatisfied) {
        await clearAttendeeCompletionDeadline(handle, attendeeId)
      } else {
        await startAttendeeCompletionDeadline(handle, attendeeId, completionDeadline)
      }

      return payment
    },

    async createAttendeePaymentCharge(handle, attendeeId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.payment === null) {
        return
      }

      const payment = await attendancePaymentService.syncPayment(handle, attendee.payment.id)

      if (payment.status === "PAID") {
        return
      }

      if (payment.status !== "AUTHORIZED") {
        throw new TaskSkippedError(
          `Payment(ID=${attendee.payment.id}) has status ${payment.status} and has no reservation to capture`
        )
      }

      await attendancePaymentService.capture(handle, attendee.payment.id)
      await broadcastPaymentChange(handle, attendance, attendeeId)
    },

    async cancelAttendeePayment(handle, attendeeId, refundedByUserId: UserId) {
      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.payment === null) {
        throw new FailedPreconditionError(`Attendee(ID=${attendeeId}) has no payment to cancel`)
      }

      const payment = await attendancePaymentService.syncPayment(handle, attendee.payment.id)

      if (payment.canRefund) {
        await attendancePaymentService.refund(handle, attendee.payment.id, refundedByUserId)
      } else if (payment.canCancel) {
        await attendancePaymentService.cancel(handle, attendee.payment.id)
      } else if (payment.status === "REFUNDED") {
        throw new FailedPreconditionError(`Attendee(ID=${attendeeId}) has already been refunded`)
      } else {
        throw new FailedPreconditionError(`Attendee(ID=${attendeeId}) has not paid`)
      }

      await clearAttendeeCompletionDeadline(handle, attendeeId)
      await broadcastPaymentChange(handle, attendance, attendeeId)
    },

    async waiveAttendeePayment(handle, attendeeId, waivedByUserId, reason) {
      const attendee = await this.getAttendeeById(handle, attendeeId)

      if (attendee.payment === null) {
        throw new FailedPreconditionError("Attendee has no payment requirement to waive")
      }

      await attendancePaymentService.waive(handle, attendee.payment.id, waivedByUserId, reason)
      await clearAttendeeCompletionDeadline(handle, attendeeId)

      const attendance = await this.getAttendanceByAttendeeId(handle, attendeeId)

      await broadcastPaymentChange(handle, attendance, attendeeId)
    },

    async syncAttendeePayment(handle, attendeeId) {
      const attendance = await attendanceRepository.findAttendanceByAttendeeId(handle, attendeeId)

      if (attendance === null) {
        throw new NotFoundError(`No Attendance found for Attendee(ID=${attendeeId})`)
      }

      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found in Attendance(ID=${attendance.id})`)
      }

      if (attendee.payment === null) {
        return
      }

      const payment = await attendancePaymentService.syncPayment(handle, attendee.payment.id)
      const now = getCurrentUTC()

      await broadcastPaymentChange(handle, attendance, attendeeId)

      if (!payment.isRequirementSatisfied) {
        const hasFailedAttempt =
          payment.status === "FAILED" || payment.status === "EXPIRED" || payment.status === "CANCELLED"

        if (hasFailedAttempt && attendee.completionDeadline !== null) {
          const completionTask = await taskSchedulingService.findVerifyAttendanceCompletionTask(handle, attendeeId)

          // A delayed payment can fail after the original completion check finished while it was processing.
          if (completionTask?.status === "COMPLETED") {
            await taskSchedulingService.scheduleAt(
              handle,
              tasks.VERIFY_ATTENDANCE_COMPLETION,
              { attendeeId },
              new TZDate(max([now, attendee.completionDeadline]), "UTC")
            )
          }
        }

        return
      }

      await completePaymentRequirement(handle, attendance, attendeeId, payment)
    },

    async executeVerifyAttendanceCompletionTask(handle, { attendeeId }) {
      const attendance = await this.findAttendanceByAttendeeId(handle, attendeeId)
      if (attendance === null) {
        throw new TaskSkippedError(`Attendance for Attendee(ID=${attendeeId}) no longer exists`)
      }

      const event = await eventService.getByAttendanceId(handle, attendance.id)
      const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)

      if (attendee === undefined) {
        throw new TaskSkippedError(`Attendee(ID=${attendeeId}) no longer exists in Attendance(ID=${attendance.id})`)
      }

      if (attendee.completionDeadline === null || isAfter(attendee.completionDeadline, getCurrentUTC())) {
        return
      }

      const payment =
        attendee.payment === null ? null : await attendancePaymentService.syncPayment(handle, attendee.payment.id)
      const synchronizedAttendee = { ...attendee, payment }

      if (getMissingAttendanceCompletionRequirements(attendance, synchronizedAttendee).length === 0) {
        if (payment?.isRequirementSatisfied === true) {
          await completePaymentRequirement(handle, attendance, attendeeId, payment)
        } else {
          await clearAttendeeCompletionDeadline(handle, attendeeId)
        }

        await broadcastPaymentChange(handle, attendance, attendeeId)

        return
      }

      if (payment === null) {
        return
      }

      // The reservation timeout bounds checkout outages, but an unavailable checkout is not a missed payment.
      if (payment.isCheckoutPending === true) {
        await this.deregisterAttendee(handle, attendeeId, {
          ignoreDeregistrationWindow: true,
        })

        return
      }

      const hasUnpaidAttempt =
        payment.status === "UNPAID" ||
        payment.status === "CANCELLED" ||
        payment.status === "EXPIRED" ||
        payment.status === "FAILED"

      // Based on whether the deadline has passed, we either kick them off the event, or suspend them indefinitely
      if (hasUnpaidAttempt && isPast(attendance.deregisterDeadline)) {
        const mark = await markService.create(
          handle,
          {
            details: `Suspensjon for å ikke betale for arrangement ${event.title}`,
            // We do not have a method for indefinite duration yet.
            duration: INDEFINITE_SUSPENSION_DURATION,
            title: "Suspensjon for manglende betaling",
            type: "MISSING_PAYMENT",
            // Immediate suspension
            weight: SUSPENSION_MARK_WEIGHT,
          },
          event.hostingGroups.map((group) => group.slug)
        )

        await personalMarkService.addToUser(handle, attendee.userId, mark.id)

        const missingPaymentMark = await markService.create(
          handle,
          {
            details: `Betalingsfristen for arrangement ${event.title} ble ikke overholdt`,
            duration: DEFAULT_MARK_DURATION,
            title: `Manglende betaling for ${event.title}`,
            type: "MISSING_PAYMENT",
            weight: 1,
          },
          event.hostingGroups.map((group) => group.slug)
        )

        await personalMarkService.addToUser(handle, attendee.userId, missingPaymentMark.id)

        await clearAttendeeCompletionDeadline(handle, attendeeId)

        logger.info(
          "Suspended User(ID=%s) for missing payment for Event(ID=%s,Title=%s) with deregister deadline %s",
          attendee.userId,
          event.id,
          event.title,
          attendance.deregisterDeadline
        )
      } else if (hasUnpaidAttempt) {
        await this.deregisterAttendee(handle, attendeeId, {
          // TODO: Maybe this should be false?
          ignoreDeregistrationWindow: true,
          automaticDeregistrationReason: {
            title: "Påmeldingen ble ikke fullført",
            details: "Betalingen ble ikke gjennomført innen fristen.",
          },
        })
      } else {
        await broadcastPaymentChange(handle, attendance, attendeeId)
      }
    },

    async executeVerifyFeedbackAnsweredTask(handle, { feedbackFormId }) {
      const previousTask = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, feedbackFormId)

      if (previousTask?.status === "COMPLETED") {
        throw new Error("executeVerifyFeedbackAnsweredTask tried to run after already having completed")
      }

      const feedbackForm = await feedbackFormService.findById(handle, feedbackFormId)
      if (feedbackForm === null) {
        throw new TaskSkippedError(`FeedbackForm(ID=${feedbackFormId}) no longer exists`)
      }

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

      const answers = await feedbackAnswerService.findManyByFeedbackFormId(handle, feedbackForm.id)

      const attendeesWithoutAnswers = attendedAttendees.filter(
        (attendee) => !answers.some((answer) => answer.attendeeId === attendee.id)
      )

      if (attendeesWithoutAnswers.length === 0) return

      const mark = await markService.create(
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

    async executeSendFeedbackFormLinkEmailsRecurringTask(handle) {
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
        if (!feedbackForm) {
          return
        }

        const attendance = await this.getAttendanceById(handle, event.attendanceId)

        const attendees = attendance.attendees
        const attendedAttendees = attendees.filter((attendee) => Boolean(attendee.attendedAt))

        const answers = await feedbackAnswerService.findManyByFeedbackFormId(handle, feedbackForm.id)

        const attendeesWithoutAnswers = attendedAttendees.filter(
          (attendee) => !answers.some((answer) => answer.attendeeId === attendee.id)
        )
        const bcc = attendeesWithoutAnswers.map((a) => a.user.email).filter((email) => email !== null)

        if (bcc.length === 0) {
          return
        }

        const hostingGroupEmail = findFirstHostingGroupEmail(event) ?? "bedkom@online.ntnu.no"
        logger.info(
          "Sending feedback form email for Event(ID=%s) to %d attendees from email %s",
          event.id,
          bcc.length,
          hostingGroupEmail
        )

        await emailService.send({
          fromEmailAddress: hostingGroupEmail,
          bcc,
          subject: formatEmailSubject(`Tilbakemelding på ${event.title}`),
          definition: emails.FEEDBACK_FORM_LINK,
          data: {
            eventName: event.title,
            eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
            eventImageUrl: event.imageUrl,
            feedbackLink: `${configuration.WEB_PUBLIC_ORIGIN}/tilbakemelding/${event.id}`,
            eventStart: event.start.toISOString(),
            feedbackDeadline: feedbackForm.answerDeadline.toISOString(),
            organizerEmail: hostingGroupEmail,
          },
        })
      })

      await Promise.all(promises)
    },

    async executeVerifyAttendeeAttendedTaskRecurringTask(handle) {
      const eventsEndedYesterday = await eventService.findEvents(handle, {
        byEndDate: {
          min: new TZDate(startOfYesterday()),
          max: new TZDate(endOfYesterday()),
        },
      })

      const errors: Error[] = []

      for (const event of eventsEndedYesterday) {
        if (event.attendanceId === null || !event.markForMissedAttendance) {
          continue
        }

        try {
          const attendance = await this.getAttendanceById(handle, event.attendanceId)
          const attendeesNotAttended = attendance.attendees.filter(
            (attendee) => attendee.registeredAt !== null && attendee.attendedAt === null
          )

          if (attendeesNotAttended.length === 0) {
            continue
          }

          const mark = await markService.create(
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

          const organizerEmails = [...new Set(getOrganizerEmails(event))]

          const eventLink = createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title)
          const markLink = new URL(`/admin/prikker/${mark.id}`, configuration.WEB_PUBLIC_ORIGIN).toString()

          await emailService.send({
            replyTo: [DEFAULT_EMAIL_FROM_EMAIL_ADDRESS],
            to: organizerEmails,
            subject: formatEmailSubject(`Automatiske prikker for manglende oppmøte på ${event.title}`),
            definition: emails.EVENT_MISSED_ATTENDANCE_MARKS,
            data: {
              eventName: event.title,
              eventLink,
              markLink,
              affectedAttendeeCount: attendeesNotAttended.length,
            },
          })
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

    async registerAttendance(handle, attendeeId, attendedAt = getCurrentUTC()) {
      const attendee = await this.getAttendeeById(handle, attendeeId)

      if (attendee === null) {
        throw new NotFoundError(`Attendee(ID=${attendeeId}) not found`)
      }

      if (attendee.attendedAt !== null && attendedAt !== null) {
        return
      }

      await attendanceRepository.updateAttendeeById(
        handle,
        attendeeId,
        AttendeeWriteSchema.parse({
          ...attendee,
          attendedAt,
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
      const attendance = await this.findAttendanceById(handle, attendanceId)
      if (attendance === null) {
        throw new TaskSkippedError(`Attendance(ID=${attendanceId}) no longer exists`)
      }

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
    async notifyAttendees(handle, attendanceId, message, title) {
      const attendance = await this.getAttendanceById(handle, attendanceId)
      const event = await eventService.getByAttendanceId(handle, attendanceId)

      if (isBefore(getCurrentUTC(), attendance.registerStart)) {
        throw new IllegalStateError(
          `Cannot send message to attendees for Attendance(ID=${attendance.id}) before register start`
        )
      }

      const hostingGroupEmail = findFirstHostingGroupEmail(event)

      if (hostingGroupEmail === null) {
        logger.warn(
          "Notification email sent for Event(ID=%s, Name=%s) did not have sufficient organizer email so %s was used.",
          event.id,
          event.title,
          DEFAULT_EMAIL_FROM_EMAIL_ADDRESS
        )
      }

      const sourceEmail = hostingGroupEmail ?? DEFAULT_EMAIL_FROM_EMAIL_ADDRESS
      const senderGroup = event.hostingGroups.find(
        (group) => group.email === sourceEmail && (group.type === "COMMITTEE" || group.type === "NODE_COMMITTEE")
      )

      const fromName = senderGroup === undefined ? undefined : getGroupDisplayName(senderGroup)

      // We send the same email to all registered attendees, and then send a personalized email to all attendees in the
      // queue with their position in the queue
      const deliveries: { recipientEmails: string[]; queuePosition: number | null }[] = []
      const registeredEmails: string[] = []

      for (const attendee of attendance.attendees) {
        if (attendee.user.email === null) {
          continue
        }

        if (attendee.registeredAt !== null) {
          registeredEmails.push(attendee.user.email)

          continue
        }

        const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)

        deliveries.push({ recipientEmails: [attendee.user.email], queuePosition })
      }

      // We add all the registered attendees into the same delivery, since they all receive the same message
      if (registeredEmails.length > 0) {
        deliveries.unshift({ recipientEmails: registeredEmails, queuePosition: null })
      }

      const sendPromises = deliveries.map((delivery) => {
        return emailService.send({
          fromEmailAddress: sourceEmail,
          replyTo: [sourceEmail],
          bcc: delivery.recipientEmails,
          subject: formatEmailSubject(title),
          definition: emails.EVENT_MESSAGE,
          data: {
            eventName: event.title,
            eventLink: createAbsoluteEventPageUrl(configuration.WEB_PUBLIC_ORIGIN, event.id, event.title),
            eventImageUrl: event.imageUrl,
            message,
            queuePosition: delivery.queuePosition,
          },
          fromName,
        })
      })

      await Promise.all(sendPromises)
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
  if (data.capacity < 0) {
    throw new InvalidArgumentError("Capacity for pool must be zero or positive")
  }

  if (data.mergeDelayHours !== null && (data.mergeDelayHours < 0 || data.mergeDelayHours > MAX_MERGE_DELAY_HOURS)) {
    throw new InvalidArgumentError(`Merge delay for pool must be between 0 and ${MAX_MERGE_DELAY_HOURS} hours`)
  }

  const hasMergeDelay = data.mergeDelayHours !== null && data.mergeDelayHours > 0

  if (hasMergeDelay && data.capacity !== 0) {
    throw new InvalidArgumentError("Capacity for pool must be unlimited (0) when the pool has a merge delay")
  }

  if (data.yearCriteria.some((year) => year < 1 || year > 5)) {
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

      case "IGNORE_MEMBERSHIP":
        logger.info(
          "Registration to Event(ID=%s, Title=%s) for User(ID=%s, Name=%s) is permitted to ignore missing membership",
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

function emitRegisterChange(
  eventEmitter: EventEmitter,
  attendance: Attendance,
  attendee: Attendee,
  status: RegisterChangeEvent["status"]
) {
  let attendees: Attendee[]

  if (status === "registered") {
    attendees = [...attendance.attendees, attendee]
  } else if (status === "deregistered") {
    attendees = attendance.attendees.filter((existingAttendee) => existingAttendee.id !== attendee.id)
  } else {
    attendees = attendance.attendees.map((existingAttendee) => {
      if (existingAttendee.id === attendee.id) {
        return attendee
      }

      return existingAttendee
    })
  }

  eventEmitter.emit("attendance:register-change", {
    attendee,
    status,
    poolOccupancies: buildPoolOccupancies({
      ...attendance,
      attendees,
    }),
  } satisfies RegisterChangeEvent)
}

export function buildRegistrationAvailabilityView(
  userId: UserId,
  result: RegistrationAvailabilityResult,
  punishment: Punishment | null,
  attendance: Attendance
): RegistrationAvailabilityView {
  if (!result.success && result.userCause !== null) {
    return {
      userId,
      punishment,
      pool: null,
      registration: {
        canRegister: false,
        eventRejectionCause: result.eventCause,
        userRejectionCause: result.userCause,
        reservationActiveAt: null,
        willBeQueued: false,
        hasMergeDelay: false,
      },
      deregistration: null,
      completion: null,
    }
  }

  const { pool, reservationActiveAt } = result
  const registeredCount = getRegisteredAttendeeCount(attendance, pool.id)
  const isPoolFull = pool.capacity !== 0 && registeredCount >= pool.capacity
  const willBeQueued = isFuture(reservationActiveAt) || isPoolFull
  const hasMergeDelay = pool.mergeDelayHours !== null && pool.mergeDelayHours > 0

  return {
    userId,
    punishment,
    pool: {
      id: pool.id,
      mergeDelayHours: pool.mergeDelayHours,
      isPoolFull,
    },
    registration: {
      canRegister: result.success,
      eventRejectionCause: result.success ? null : result.eventCause,
      userRejectionCause: null,
      reservationActiveAt,
      willBeQueued,
      hasMergeDelay,
    },
    deregistration: null,
    completion: null,
  }
}

export function buildDeregistrationAvailabilityView(
  userId: UserId,
  attendee: Attendee,
  attendance: Attendance,
  chargeScheduleDate: Date | null
): RegistrationAvailabilityView {
  const actualDeregisterDeadline = chargeScheduleDate
    ? min([attendance.deregisterDeadline, chargeScheduleDate])
    : attendance.deregisterDeadline

  const isPastDeregisterDeadline = !isFuture(actualDeregisterDeadline)
  const hasBeenCharged = isAttendeeChargedAndUnrefunded(attendee)

  const gracePeriodEnd = addMilliseconds(
    attendee.createdAt,
    DEREGISTER_GRACE_PERIOD_MS - DEREGISTER_GRACE_PERIOD_CLOCK_SKEW_MS
  )
  const isWithinGracePeriod = isFuture(gracePeriodEnd)
  const requiresDeregisterReason = !isWithinGracePeriod

  let rejectionCause: NonNullable<RegistrationAvailabilityView["deregistration"]>["rejectionCause"] = null

  if (hasBeenCharged) {
    rejectionCause = "PAYMENT_COMPLETED"
  } else if (attendee.registeredAt !== null && isPastDeregisterDeadline) {
    rejectionCause = "DEREGISTER_DEADLINE_PASSED"
  }

  const canDeregister = rejectionCause === null

  return {
    userId,
    punishment: null,
    pool: null,
    registration: null,
    deregistration: {
      attendeeId: attendee.id,
      canDeregister,
      rejectionCause,
      isWithinGracePeriod,
      requiresDeregisterReason,
      actualDeregisterDeadline,
      isPastDeregisterDeadline,
      hasBeenCharged,
      chargeScheduleDate,
    },
    completion: buildRegistrationAvailabilityCompletionView(attendance, attendee),
  }
}
