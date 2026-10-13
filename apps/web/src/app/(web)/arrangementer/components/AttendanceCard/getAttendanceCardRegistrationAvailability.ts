import type { AttendanceRouter } from "@dotkomonline/rpc"
import {
  type AttendanceView,
  type Attendee,
  DEREGISTER_GRACE_PERIOD_CLOCK_SKEW_MS,
  DEREGISTER_GRACE_PERIOD_MS,
  buildRegistrationAvailabilityCompletionView,
  isAttendeeChargedAndUnrefunded,
} from "@dotkomonline/rpc/attendance"

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

export function getDeregisterGracePeriodEnd(attendee: Attendee | null): Date | null {
  if (attendee === null) {
    return null
  }

  return new Date(attendee.createdAt.getTime() + DEREGISTER_GRACE_PERIOD_MS - DEREGISTER_GRACE_PERIOD_CLOCK_SKEW_MS)
}

export function getAttendanceCardRegistrationAvailability(
  attendance: AttendanceView,
  attendee: Attendee | null,
  availability: RegistrationAvailability | undefined,
  now = new Date()
): RegistrationAvailability | undefined {
  if (availability === undefined) {
    return undefined
  }

  // The attendance and availability queries can finish in either order after an SSE update.
  // Wait for the matching view before offering actions for a different registration.
  if (attendee === null) {
    if (availability.deregistration !== null) {
      return undefined
    }

    return { ...availability, completion: null }
  }

  const deregistration = availability.deregistration

  if (deregistration?.attendeeId !== attendee.id) {
    return undefined
  }

  const actualDeregisterDeadline = new Date(
    Math.min(attendance.deregisterDeadline.getTime(), deregistration.chargeScheduleDate?.getTime() ?? Infinity)
  )
  const isPastDeregisterDeadline = actualDeregisterDeadline <= now
  const hasBeenCharged = isAttendeeChargedAndUnrefunded(attendee)
  const gracePeriodEnd = getDeregisterGracePeriodEnd(attendee)
  const isWithinGracePeriod = gracePeriodEnd !== null && gracePeriodEnd > now
  let rejectionCause: typeof deregistration.rejectionCause = null

  if (hasBeenCharged) {
    rejectionCause = "PAYMENT_COMPLETED"
  } else if (attendee.registered && isPastDeregisterDeadline) {
    rejectionCause = "DEREGISTER_DEADLINE_PASSED"
  }

  return {
    ...availability,
    completion: buildRegistrationAvailabilityCompletionView(attendance, attendee),
    deregistration: {
      ...deregistration,
      actualDeregisterDeadline,
      isPastDeregisterDeadline,
      hasBeenCharged,
      isWithinGracePeriod,
      requiresDeregisterReason: !isWithinGracePeriod,
      rejectionCause,
      canDeregister: rejectionCause === null,
    },
  }
}
