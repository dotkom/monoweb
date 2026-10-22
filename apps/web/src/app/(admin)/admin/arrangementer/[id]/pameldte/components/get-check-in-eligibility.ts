import { type Attendance, type Attendee, getAttendeePaymentStatus } from "@dotkomonline/rpc/attendance"

export function getCheckInEligibility(attendance: Attendance, attendee: Attendee | undefined) {
  const price = attendance.attendancePrice
  const requiresPayment = price !== null && price > 0
  const paymentStatus = attendee ? getAttendeePaymentStatus(attendee) : null
  const hasPaid = paymentStatus === "charged" || paymentStatus === "reserved"
  const hasCompletedPayment = !requiresPayment || hasPaid

  const hasRegistrationPool = attendance.pools.some((pool) => pool.id === attendee?.attendancePoolId)
  const hasAttended = attendee?.attendedAt != null
  const isRegistered = attendee?.registered === true

  const canCheckIn = attendee !== undefined && hasRegistrationPool && !hasAttended
  const canAutomaticallyCheckIn = canCheckIn && isRegistered && hasCompletedPayment

  return { hasCompletedPayment, canCheckIn, canAutomaticallyCheckIn }
}
