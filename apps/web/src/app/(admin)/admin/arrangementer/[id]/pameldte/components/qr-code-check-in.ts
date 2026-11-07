import {
  type Attendance,
  type Attendee,
  type AttendeeId,
  getAttendeePaymentStatus,
  hasAttendeeCompletedSelections,
} from "@dotkomonline/rpc/attendance"

export type QrCodeCheckIn = {
  attendeeId: AttendeeId
  isAutomaticCheckIn: boolean
} & (
  | {
      status: "registered" | "already-attended"
      attendedAt: Date
    }
  | {
      status: "confirmation-required" | "registering" | "undoing" | "undone" | "registration-failed" | "undo-failed"
      attendedAt: Date | null
    }
)

export type QrCodeCheckInStatus = QrCodeCheckIn["status"]

export function isQrCodeCheckInPending(status: QrCodeCheckInStatus | undefined) {
  return status === "registering" || status === "undoing"
}

export function getCheckInEligibility(attendance: Attendance, attendee: Attendee | undefined) {
  const price = attendance.attendancePrice
  const isPaymentRequired = price !== null && price > 0
  const paymentStatus = attendee === undefined ? null : getAttendeePaymentStatus(attendee)
  const hasPaid = paymentStatus === "charged" || paymentStatus === "reserved"
  const hasCompletedPayment = !isPaymentRequired || hasPaid
  const hasCompletedSelections = attendee !== undefined && hasAttendeeCompletedSelections(attendance, attendee)

  const hasRegistrationPool = attendance.pools.some((pool) => pool.id === attendee?.attendancePoolId)
  const hasAttended = attendee?.attendedAt != null
  const isRegistered = attendee?.registeredAt != null

  const canCheckIn = attendee !== undefined && hasRegistrationPool && !hasAttended
  const canAutomaticallyCheckIn = canCheckIn && isRegistered && hasCompletedPayment && hasCompletedSelections

  return { hasCompletedPayment, hasCompletedSelections, hasRegistrationPool, canCheckIn, canAutomaticallyCheckIn }
}
