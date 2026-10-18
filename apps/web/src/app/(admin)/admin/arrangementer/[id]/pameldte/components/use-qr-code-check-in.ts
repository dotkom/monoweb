import type { Attendance, Attendee, AttendeeId } from "@dotkomonline/rpc/attendance"
import { getCurrentUTC } from "@dotkomonline/utils"
import { toast } from "@dotkomonline/ui"
import { useRef, useState } from "react"
import { showAutomaticCheckInToast } from "./automatic-check-in-toast"
import { type QrCodeCheckIn, getCheckInEligibility, isQrCodeCheckInPending } from "./qr-code-check-in"

type UseQrCodeCheckInOptions = {
  attendance: Attendance
  onUpdateAttendance: (attendeeId: AttendeeId, attendedAt: Date | null) => Promise<void>
}

export function useQrCodeCheckIn({ attendance, onUpdateAttendance }: UseQrCodeCheckInOptions) {
  const [checkIn, setCheckIn] = useState<QrCodeCheckIn | null>(null)

  // Camera callbacks could repeat before React renders the paused scanner
  const activeCheckInReference = useRef<QrCodeCheckIn | null>(null)
  const lastScannedAttendeeIdReference = useRef<AttendeeId | null>(null)

  const updateCheckIn = (nextCheckIn: QrCodeCheckIn | null) => {
    activeCheckInReference.current = nextCheckIn
    setCheckIn(nextCheckIn)
  }

  const registerAutomatically = async (attendee: Attendee) => {
    const attendeeName = attendee.user.name ?? attendee.user.username

    try {
      await onUpdateAttendance(attendee.id, getCurrentUTC())

      showAutomaticCheckInToast(attendeeName, () => onUpdateAttendance(attendee.id, null))
    } catch {
      lastScannedAttendeeIdReference.current = null
      toast.add({ type: "error", title: "Kunne ikke registrere oppmøte.", description: attendeeName })
    } finally {
      updateCheckIn(null)
    }
  }

  const updateAttendance = async (currentCheckIn: QrCodeCheckIn, attendedAt: Date | null) => {
    const isUndoing = attendedAt === null
    const pendingStatus = isUndoing ? "undoing" : "registering"
    const pendingCheckIn: QrCodeCheckIn = { ...currentCheckIn, status: pendingStatus }

    updateCheckIn(pendingCheckIn)

    try {
      await onUpdateAttendance(currentCheckIn.attendeeId, attendedAt)

      const completedCheckIn: QrCodeCheckIn =
        attendedAt === null
          ? { ...currentCheckIn, status: "undone", attendedAt: null }
          : { ...currentCheckIn, status: "registered", attendedAt }

      updateCheckIn(completedCheckIn)
    } catch {
      const failedStatus = isUndoing ? "undo-failed" : "registration-failed"

      updateCheckIn({ ...currentCheckIn, status: failedStatus })
    }
  }

  const scanAttendee = (attendeeId: AttendeeId) => {
    const currentCheckIn = activeCheckInReference.current

    if (currentCheckIn !== null || lastScannedAttendeeIdReference.current === attendeeId) {
      return
    }

    lastScannedAttendeeIdReference.current = attendeeId

    const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
    const attendedAt = attendee?.attendedAt ?? null
    const eligibility = getCheckInEligibility(attendance, attendee)
    const initialCheckIn: QrCodeCheckIn = {
      attendeeId,
      isAutomaticCheckIn: eligibility.canAutomaticallyCheckIn,
      ...(attendedAt === null
        ? { status: "confirmation-required", attendedAt: null }
        : { status: "already-attended", attendedAt }),
    }

    if (eligibility.canAutomaticallyCheckIn && attendee !== undefined) {
      updateCheckIn({ ...initialCheckIn, status: "registering" })
      void registerAutomatically(attendee)

      return
    }

    updateCheckIn(initialCheckIn)
  }

  const registerAttendance = () => {
    const currentCheckIn = activeCheckInReference.current
    const canAttemptRegistration = currentCheckIn?.status === "confirmation-required"

    if (currentCheckIn === null || currentCheckIn !== checkIn || !canAttemptRegistration) {
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
    const canUndoRegistration = currentCheckIn?.status === "registered"

    if (currentCheckIn === null || currentCheckIn !== checkIn || !canUndoRegistration) {
      return
    }

    void updateAttendance(currentCheckIn, null)
  }

  const closeCheckIn = () => {
    const currentCheckIn = activeCheckInReference.current
    const currentStatus = currentCheckIn?.status
    const isPending = isQrCodeCheckInPending(currentStatus)

    if (isPending || currentCheckIn !== checkIn) {
      return
    }

    updateCheckIn(null)
    lastScannedAttendeeIdReference.current = null
  }

  return { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn }
}
