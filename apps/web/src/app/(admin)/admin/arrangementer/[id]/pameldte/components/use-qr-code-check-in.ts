import type { Attendance, AttendeeId } from "@dotkomonline/rpc/attendance"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useRef, useState } from "react"
import { getCheckInEligibility } from "./get-check-in-eligibility"

export type QrCodeCheckInStatus =
  | "confirmation-required"
  | "already-attended"
  | "registering"
  | "registered"
  | "undoing"
  | "undone"
  | "registration-failed"
  | "undo-failed"

export type QrCodeCheckIn = {
  attendeeId: AttendeeId
  status: QrCodeCheckInStatus
  attendedAt: Date | null
  isAutomaticCheckIn: boolean
}

type UseQrCodeCheckInOptions = {
  attendance: Attendance
  onUpdateAttendance: (attendeeId: AttendeeId, attendedAt: Date | null) => Promise<void>
}

export function useQrCodeCheckIn({ attendance, onUpdateAttendance }: UseQrCodeCheckInOptions) {
  const [checkIn, setCheckIn] = useState<QrCodeCheckIn | null>(null)

  // Camera callbacks can repeat before React renders the paused scanner.
  const activeCheckInReference = useRef<QrCodeCheckIn | null>(null)

  const updateCheckIn = (nextCheckIn: QrCodeCheckIn | null) => {
    activeCheckInReference.current = nextCheckIn
    setCheckIn(nextCheckIn)
  }

  const updateAttendance = async (currentCheckIn: QrCodeCheckIn, attendedAt: Date | null) => {
    const isUndoing = attendedAt === null
    const pendingStatus = isUndoing ? "undoing" : "registering"
    const pendingCheckIn: QrCodeCheckIn = { ...currentCheckIn, status: pendingStatus }

    updateCheckIn(pendingCheckIn)

    try {
      await onUpdateAttendance(currentCheckIn.attendeeId, attendedAt)

      const completedStatus = isUndoing ? "undone" : "registered"
      updateCheckIn({ ...currentCheckIn, status: completedStatus, attendedAt })
    } catch {
      const failedStatus = isUndoing ? "undo-failed" : "registration-failed"
      updateCheckIn({ ...currentCheckIn, status: failedStatus })
    }
  }

  const scanAttendee = (attendeeId: AttendeeId) => {
    if (activeCheckInReference.current !== null) {
      return
    }

    const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
    const attendedAt = attendee?.attendedAt ?? null
    const hasAttended = attendedAt !== null
    const initialStatus = hasAttended ? "already-attended" : "confirmation-required"
    const eligibility = getCheckInEligibility(attendance, attendee)
    const initialCheckIn: QrCodeCheckIn = {
      attendeeId,
      status: initialStatus,
      attendedAt,
      isAutomaticCheckIn: eligibility.canAutomaticallyCheckIn,
    }

    updateCheckIn(initialCheckIn)

    if (eligibility.canAutomaticallyCheckIn) {
      void updateAttendance(initialCheckIn, getCurrentUTC())
    }
  }

  const registerAttendance = () => {
    const currentCheckIn = activeCheckInReference.current
    const canAttemptRegistration =
      currentCheckIn?.status === "confirmation-required" || currentCheckIn?.status === "registration-failed"

    if (!currentCheckIn || !canAttemptRegistration) {
      return
    }

    const attendee = attendance.attendees.find((attendee) => attendee.id === currentCheckIn.attendeeId)
    const eligibility = getCheckInEligibility(attendance, attendee)

    if (!eligibility.canCheckIn) {
      return
    }

    void updateAttendance(currentCheckIn, getCurrentUTC())
  }

  const undoAttendance = () => {
    const currentCheckIn = activeCheckInReference.current
    const canUndoRegistration = currentCheckIn?.status === "registered" || currentCheckIn?.status === "undo-failed"

    if (!currentCheckIn || !canUndoRegistration) {
      return
    }

    void updateAttendance(currentCheckIn, null)
  }

  const closeCheckIn = () => {
    const currentStatus = activeCheckInReference.current?.status
    const isPending = currentStatus === "registering" || currentStatus === "undoing"

    if (isPending) {
      return
    }

    updateCheckIn(null)
  }

  return { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn }
}
