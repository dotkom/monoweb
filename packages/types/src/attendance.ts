import { schemas } from "@dotkomonline/db/schemas"
import { compareAsc } from "date-fns"
import { z } from "zod"
import { type User, type UserId, UserSchema, findActiveMembership, getMembershipGrade } from "./user"

// TODO: Where on earth does this come from?
export type AttendanceStatus = "NotOpened" | "Open" | "Closed"

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

export function getAttendanceCapacity(attendance: Attendance): number {
  return attendance.pools.reduce((total, pool) => total + pool.capacity, 0)
}

export function isAttendable(user: User, pool: AttendancePool) {
  const membership = findActiveMembership(user)
  if (membership === null) {
    return false
  }

  const grade = getMembershipGrade(membership)
  if (grade === null) {
    return false
  }

  if (pool.yearCriteria.length === 0) {
    return true
  }

  return pool.yearCriteria.includes(grade)
}

export const getAttendee = (attendance: Attendance | null, user: User | UserId | null) => {
  if (!attendance || !user) {
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

export const hasAttendeePaid = (
  attendance: Attendance,
  attendee: Attendee | null,
  options?: { excludeReservation?: boolean }
): boolean | null => {
  if (!attendance.attendancePrice) {
    return null
  }

  if (!attendee) {
    return false
  }

  const hasReserved = options?.excludeReservation ? false : Boolean(attendee.paymentReservedAt)

  return Boolean(attendee.paymentChargedAt || hasReserved || (attendee.paymentRefundedAt && !attendee.paymentDeadline))
}
