import { schemas } from "@dotkomonline/db/schemas"
import { compareAsc, hoursToMilliseconds, secondsToMilliseconds } from "date-fns"
import { z } from "zod"
import { PunishmentSchema } from "./mark"
import { type User, type UserId, UserSchema, findActiveMembership } from "./user"
import { getStudyGrade } from "@dotkomonline/utils"

/**
 * Grace period after registration during which deregistration requires no reason.
 *
 * This duration was chosen arbitrarily, though it seemed nice to not overlap with the 1 hour payment deadline.
 * Frontends should account for a few seconds to account for clock skew to avoid errors near the grace period end.
 */
export const DEREGISTER_GRACE_PERIOD_MS = hoursToMilliseconds(2)

/**
 * Clock skew buffer subtracted from grace period end for UI eligibility display.
 */
export const DEREGISTER_GRACE_PERIOD_CLOCK_SKEW_MS = secondsToMilliseconds(15)

export type AttendanceStatus = "NOT_OPENED" | "OPEN" | "CLOSED"

export type AttendanceSelection = z.infer<typeof AttendanceSelectionSchema>
export const AttendanceSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type AttendanceSelectionResponse = z.infer<typeof AttendanceSelectionResponseSchema>
export const AttendanceSelectionResponseSchema = z.object({
  selectionId: z.string(),
  selectionName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
})

export type AttendeeSelectionResponse = z.infer<typeof AttendeeSelectionResponseSchema>
export const AttendeeSelectionResponseSchema = AttendanceSelectionResponseSchema

export type AttendeeId = Attendee["id"]
export type Attendee = z.infer<typeof AttendeeSchema>
/**
 * Attendee is a user who has registered for an event, with their selections.
 *
 * The attendee's User object is included, but without memberships.
 */
export const AttendeeSchema = schemas.AttendeeSchema.extend({
  user: UserSchema,
  selections: z.array(AttendanceSelectionResponseSchema),
})

export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export const AttendeeWriteSchema = AttendeeSchema.pick({
  attendedAt: true,
  earliestReservationAt: true,
  reserved: true,
  selections: true,
  /** The attending user's grade at time of registration. */
  userGrade: true,
})

export type AttendeePaymentWrite = z.infer<typeof AttendeePaymentWriteSchema>
export const AttendeePaymentWriteSchema = AttendeeSchema.pick({
  paymentChargedAt: true,
  paymentId: true,
  paymentDeadline: true,
  paymentChargeDeadline: true,
  paymentLink: true,
  paymentReservedAt: true,
  paymentRefundedAt: true,
  paymentRefundedById: true,
  paymentCheckoutUrl: true,
})

export type AttendancePoolId = AttendancePool["id"]
export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export const AttendancePoolSchema = schemas.AttendancePoolSchema.extend({
  yearCriteria: z.array(z.number()),
})

export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export const AttendancePoolWriteSchema = AttendancePoolSchema.pick({
  title: true,
  capacity: true,
  mergeDelayHours: true,
  yearCriteria: true,
})

/**
 * @packageDocumentation
 *
 * The attendance type itself, with both pool and selection joins ALWAYS present.
 */

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceId = Attendance["id"]
export const AttendanceSchema = schemas.AttendanceSchema.extend({
  pools: z.array(AttendancePoolSchema),
  attendees: z.array(AttendeeSchema),
  selections: z.array(AttendanceSelectionSchema),
})

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export const AttendanceWriteSchema = AttendanceSchema.pick({
  registerStart: true,
  registerEnd: true,
  deregisterDeadline: true,
  selections: true,
})

export const AttendanceSummarySchema = schemas.AttendanceSchema.extend({
  currentUserAttendee: AttendeeSchema.nullable(),
  pools: z.array(AttendancePoolSchema),
  reservedAttendeeCount: z.number(),
})
export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>

export const RegistrationRejectionCauseSchema = z.enum([
  "SUSPENDED",
  "TOO_EARLY",
  "TOO_LATE",
  "ALREADY_REGISTERED",
  "MISSING_PARENT_REGISTRATION",
  "MISSING_PARENT_RESERVATION",
  "MISSING_MEMBERSHIP",
  "NO_MATCHING_POOL",
  "INVALID_TURNSTILE_TOKEN",
])
export type RegistrationRejectionCause = z.infer<typeof RegistrationRejectionCauseSchema>

export const RegistrationAvailabilityPoolViewSchema = z.object({
  id: AttendancePoolSchema.shape.id,
  mergeDelayHours: z.number().nullable(),
  isPoolFull: z.boolean(),
})
export type RegistrationAvailabilityPoolView = z.infer<typeof RegistrationAvailabilityPoolViewSchema>

export const DeregistrationRejectionCauseSchema = z.enum(["DEREGISTER_DEADLINE_PASSED", "PAYMENT_COMPLETED"])
export type DeregistrationRejectionCause = z.infer<typeof DeregistrationRejectionCauseSchema>

export const RegistrationAvailabilityDeregistrationViewSchema = z.object({
  attendeeId: AttendeeSchema.shape.id,
  canDeregister: z.boolean(),
  rejectionCause: DeregistrationRejectionCauseSchema.nullable(),
  isWithinGracePeriod: z.boolean(),
  requiresDeregisterReason: z.boolean(),
  actualDeregisterDeadline: z.date(),
  isPastDeregisterDeadline: z.boolean(),
  hasBeenCharged: z.boolean(),
  chargeScheduleDate: z.date().nullable(),
})
export type RegistrationAvailabilityDeregistrationView = z.infer<
  typeof RegistrationAvailabilityDeregistrationViewSchema
>

export const RegistrationAvailabilityRegistrationViewSchema = z.object({
  canRegister: z.boolean(),
  rejectionCause: RegistrationRejectionCauseSchema.nullable(),
  reservationActiveAt: z.date().nullable(),
  willBeUnreserved: z.boolean(),
  hasMergeDelay: z.boolean(),
})
export type RegistrationAvailabilityRegistrationView = z.infer<typeof RegistrationAvailabilityRegistrationViewSchema>

export const RegistrationAvailabilityViewSchema = z.object({
  userId: UserSchema.shape.id,
  punishment: PunishmentSchema.nullable(),
  pool: RegistrationAvailabilityPoolViewSchema.nullable(),
  registration: RegistrationAvailabilityRegistrationViewSchema.nullable(),
  deregistration: RegistrationAvailabilityDeregistrationViewSchema.nullable(),
})
export type RegistrationAvailabilityView = z.infer<typeof RegistrationAvailabilityViewSchema>

export function getReservedAttendeeCount(attendance: Attendance, poolId?: AttendancePoolId): number {
  if (poolId) {
    return attendance.attendees.filter((attendee) => attendee.attendancePoolId === poolId && attendee.reserved).length
  }

  return attendance.attendees.reduce((total, attendee) => total + (attendee.reserved ? 1 : 0), 0)
}

export function getUnreservedAttendeeCount(attendance: Attendance, poolId?: AttendancePoolId): number {
  if (poolId) {
    return attendance.attendees.filter((attendee) => attendee.attendancePoolId === poolId && !attendee.reserved).length
  }

  return attendance.attendees.reduce((total, attendee) => total + (attendee.reserved ? 0 : 1), 0)
}

export function getAttendanceCapacity(attendance: Attendance | AttendanceSummary): number {
  return attendance.pools.reduce((total, pool) => total + pool.capacity, 0)
}

export function isAttendable(user: User, pool: AttendancePool) {
  const membership = findActiveMembership(user)
  const grade = membership?.semester != null ? getStudyGrade(membership.semester) : null

  if (grade === null) {
    return false
  }

  if (pool.yearCriteria.length === 0) {
    return true
  }

  return pool.yearCriteria.includes(grade)
}

export const getAttendee = (attendance: Attendance | AttendanceSummary | null, user: User | UserId | null) => {
  if (!attendance) {
    return null
  }

  if ("currentUserAttendee" in attendance) {
    return attendance.currentUserAttendee
  }

  if (!user) {
    return null
  }

  const userId = typeof user === "string" ? user : user.id

  return attendance.attendees?.find((attendee) => attendee.userId === userId) ?? null
}

export const getAttendablePool = (attendance: Attendance, user: User | null) => {
  if (!user) {
    return null
  }

  const attendee = getAttendee(attendance, user)

  if (attendee) {
    return attendance.pools.find((pool) => pool.id === attendee.attendancePoolId) ?? null
  }

  return attendance.pools.find((pool) => isAttendable(user, pool)) ?? null
}

export const getNonAttendablePools = (attendance: Attendance, user: User | null) => {
  const attendablePool = getAttendablePool(attendance, user)

  return attendance.pools
    .filter((pool) => pool.id !== attendablePool?.id)
    .sort((a, b) => {
      // Highest capacity first and highest merge delay last
      if (a.mergeDelayHours && b.mergeDelayHours && a.mergeDelayHours !== b.mergeDelayHours) {
        return a.mergeDelayHours - b.mergeDelayHours
      }

      return b.capacity - a.capacity
    })
}

export const getAttendeeQueuePosition = (attendance: Attendance, user: User | null) => {
  const attendee = getAttendee(attendance, user)
  const pool = getAttendablePool(attendance, user)

  if (!attendee || !pool) {
    return null
  }

  const unreservedAttendees = attendance.attendees
    .filter((attendee) => attendee.attendancePoolId === pool.id && !attendee.reserved)
    .toSorted((a, b) => compareAsc(a.earliestReservationAt, b.earliestReservationAt))

  const index = unreservedAttendees.indexOf(attendee)

  if (index === -1) {
    return null
  }

  // Queue position is 1-indexed but arrays are 0-indexed, so we add 1
  return index + 1
}

type AttendeePaymentProps = Pick<
  Attendee,
  "paymentChargedAt" | "paymentRefundedAt" | "paymentReservedAt" | "paymentDeadline" | "paymentRefundedById"
>

export const hasAttendeePaid = (
  attendee: Omit<AttendeePaymentProps, "paymentRefundedById"> | null,
  attendancePrice: number | null,
  options?: { excludePaymentReservation?: boolean }
): boolean | null => {
  if (attendancePrice === null) {
    return null
  }

  if (attendee === null) {
    return false
  }

  const hasBeenRefunded = attendee.paymentRefundedAt !== null
  const hasBeenCharged = attendee.paymentChargedAt !== null
  const hasReserved = options?.excludePaymentReservation ? false : attendee.paymentReservedAt !== null
  const hasDeadline = attendee.paymentDeadline !== null

  return hasBeenCharged || hasReserved || (hasBeenRefunded && !hasDeadline)
}

export const isAttendeeChargedAndUnrefunded = (
  attendee: Pick<Attendee, "paymentChargedAt" | "paymentRefundedAt">
): boolean => attendee.paymentChargedAt !== null && attendee.paymentRefundedAt === null

export type AttendeePaymentStatus = "none" | "pending" | "reserved" | "charged" | "refunded" | "cancelled"

export const getAttendeePaymentStatus = (attendee: AttendeePaymentProps): AttendeePaymentStatus => {
  if (attendee.paymentRefundedAt !== null) {
    return "refunded"
  }

  if (attendee.paymentChargedAt !== null) {
    return "charged"
  }

  if (attendee.paymentReservedAt !== null) {
    return "reserved"
  }

  if (attendee.paymentRefundedById !== null) {
    return "cancelled"
  }

  if (attendee.paymentDeadline !== null) {
    return "pending"
  }

  return "none"
}
