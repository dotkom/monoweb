import type { Attendance, Attendee, AttendeeId } from "@dotkomonline/rpc/attendance"
import { getCurrentUTC } from "@dotkomonline/utils"
import { toast } from "@dotkomonline/ui"
import { addMilliseconds, differenceInMilliseconds, formatDistanceStrict, secondsToMilliseconds } from "date-fns"
import { nb } from "date-fns/locale"
import { LRUCache } from "lru-cache"
import { useRef, useState } from "react"
import { showAutomaticCheckInToast } from "./automatic-check-in-toast"
import { type QrCodeCheckIn, getCheckInEligibility, isQrCodeCheckInPending } from "./qr-code-check-in"

const RECENT_SCAN_COOLDOWN_MILLISECONDS = secondsToMilliseconds(5)
const MAX_RECENT_SCANS = 50

type UseQrCodeCheckInOptions = {
  attendance: Attendance
  onUpdateAttendance: (attendeeId: AttendeeId, attendedAt: Date | null) => Promise<void>
}

export function useQrCodeCheckIn({ attendance, onUpdateAttendance }: UseQrCodeCheckInOptions) {
  const [checkIn, setCheckIn] = useState<QrCodeCheckIn | null>(null)

  // Camera callbacks can repeat before React renders the current check-in.
  const activeCheckInReference = useRef<QrCodeCheckIn | null>(null)
  const [recentScans] = useState(
    () =>
      new LRUCache<AttendeeId, true>({
        max: MAX_RECENT_SCANS,
        ttl: RECENT_SCAN_COOLDOWN_MILLISECONDS,
        ttlResolution: 0,
      })
  )

  const lastScanToastAtReference = useRef<Date | null>(null)

  const updateCheckIn = (nextCheckIn: QrCodeCheckIn | null) => {
    activeCheckInReference.current = nextCheckIn
    setCheckIn(nextCheckIn)
  }

  const registerAutomatically = async (attendee: Attendee) => {
    const attendeeName = attendee.user.name ?? attendee.user.username

    try {
      await onUpdateAttendance(attendee.id, getCurrentUTC())

      recentScans.set(attendee.id, true)

      // Give the result a full cooldown before a repeated camera scan can show a notice
      lastScanToastAtReference.current = new Date()

      showAutomaticCheckInToast(attendeeName, () => onUpdateAttendance(attendee.id, null))
    } catch {
      recentScans.delete(attendee.id)
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

    if (currentCheckIn !== null) {
      return
    }

    const remainingMilliseconds = recentScans.getRemainingTTL(attendeeId)

    if (remainingMilliseconds > 0) {
      const now = new Date()

      const lastToastAt = lastScanToastAtReference.current
      const canShowToast =
        lastToastAt === null || differenceInMilliseconds(now, lastToastAt) >= RECENT_SCAN_COOLDOWN_MILLISECONDS

      if (canShowToast) {
        const retryAt = addMilliseconds(now, remainingMilliseconds)
        const remainingTime = formatDistanceStrict(retryAt, now, {
          unit: "second",
          roundingMethod: "ceil",
          locale: nb,
        })

        lastScanToastAtReference.current = now

        toast.add({
          type: "info",
          title: "QR-koden er nylig skannet",
          description: `Prøv igjen om ${remainingTime}.`,
          timeout: secondsToMilliseconds(2.5),
        })
      }

      return
    }

    recentScans.set(attendeeId, true)

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

    if (currentCheckIn !== null) {
      recentScans.set(currentCheckIn.attendeeId, true)
    }

    updateCheckIn(null)
  }

  return { checkIn, scanAttendee, registerAttendance, undoAttendance, closeCheckIn }
}
