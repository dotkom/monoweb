"use client"

import { type Attendance, type Attendee, getAttendeeQueuePosition } from "@dotkomonline/rpc/attendance"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  RadialProgress,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconArrowBackUp, IconCheck, IconCircleDashedCheck, IconLoader2, IconX } from "@tabler/icons-react"
import { formatDate, formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { useIsMobile } from "../../../../hooks/use-is-mobile"
import { UserBox } from "./UserBox"
import { getCheckInEligibility } from "./get-check-in-eligibility"
import type { QrCodeCheckIn } from "./use-qr-code-check-in"

const AUTOMATIC_CLOSE_DELAY_MILLISECONDS = 3_000
const PROGRESS_REFRESH_INTERVAL_MILLISECONDS = 50

export type QRCodeScannedModalProps = {
  attendance: Attendance
  checkIn: QrCodeCheckIn
  onRegisterAttendance: () => void
  onUndoAttendance: () => void
  onClose: () => void
}

export function QRCodeScannedModal({
  attendance,
  checkIn,
  onRegisterAttendance,
  onUndoAttendance,
  onClose,
}: QRCodeScannedModalProps) {
  const isMobile = useIsMobile() ?? false
  const attendee = attendance.attendees.find((attendee) => attendee.id === checkIn.attendeeId)
  const registrationPool = attendance.pools.find((pool) => pool.id === attendee?.attendancePoolId)
  const eligibility = getCheckInEligibility(attendance, attendee)

  const isPending = checkIn.status === "registering" || checkIn.status === "undoing"
  const wasCheckedInElsewhere = checkIn.status === "confirmation-required" && attendee?.attendedAt != null
  const displayedCheckIn: QrCodeCheckIn = wasCheckedInElsewhere
    ? { ...checkIn, status: "already-attended", attendedAt: attendee.attendedAt }
    : checkIn

  const handleClose = () => {
    if (isPending) {
      return
    }

    onClose()
  }

  const checkInActions = (
    <CheckInActions
      key={checkIn.attendeeId}
      checkIn={displayedCheckIn}
      canRegisterAttendance={eligibility.canCheckIn}
      onRegisterAttendance={onRegisterAttendance}
      onUndoAttendance={onUndoAttendance}
      onClose={handleClose}
    />
  )

  const hasAutomaticConfirmation = checkIn.isAutomaticCheckIn && checkIn.status === "registered"

  if (hasAutomaticConfirmation && attendee) {
    return (
      <AutomaticCheckInConfirmation key={checkIn.attendeeId} attendee={attendee} onClose={handleClose}>
        {checkInActions}
      </AutomaticCheckInConfirmation>
    )
  }

  return (
    <AlertDialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <AlertDialogContent size="md" onOutsideClick={handleClose} className="sm:p-3">
        <div className="flex items-center justify-between gap-3">
          <AlertDialogTitle>QR-kode skannet</AlertDialogTitle>

          <AlertDialogCancel type="button" aria-label="Lukk" disabled={isPending} onClick={handleClose}>
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-6">
          {!attendee && (
            <div className="flex flex-col gap-2">
              <StatusRow icon={<IconX className="text-red-600" />}>Ingen deltaker funnet</StatusRow>
              <Text>Det kan være at QR-koden er til et annet arrangement</Text>
            </div>
          )}

          {attendee && (
            <>
              <div className="flex flex-col gap-2">
                <Title element="h3" className="text-sm font-medium text-muted-foreground">
                  Du har skannet
                </Title>

                <UserBox user={attendee.user} isMobile={isMobile} />
              </div>

              <div className="flex flex-col gap-2">
                <Title element="h3" className="text-sm font-medium text-muted-foreground">
                  Påmeldingsinformasjon
                </Title>

                <RegistrationStatus attendance={attendance} attendee={attendee} />
                <PaymentStatus price={attendance.attendancePrice} hasPaid={eligibility.hasCompletedPayment} />
              </div>

              {!registrationPool && (
                <div className="flex flex-col gap-2">
                  <StatusRow icon={<IconX className="text-red-600" />}>Gruppe mangler</StatusRow>
                  <Text>Deltaker ble funnet, men påmeldingsgruppen mangler</Text>
                </div>
              )}
            </>
          )}

          <CheckInResult checkIn={displayedCheckIn} />

          {checkInActions}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AutomaticCheckInConfirmation({
  attendee,
  onClose,
  children,
}: {
  attendee: Attendee
  onClose: () => void
  children: ReactNode
}) {
  const [remainingPercentage, setRemainingPercentage] = useState(100)
  const closeConfirmationReference = useRef(onClose)
  closeConfirmationReference.current = onClose

  useEffect(() => {
    const closeAt = Date.now() + AUTOMATIC_CLOSE_DELAY_MILLISECONDS
    const progressInterval = setInterval(() => {
      const remainingMilliseconds = Math.max(0, closeAt - Date.now())
      const nextPercentage = (remainingMilliseconds / AUTOMATIC_CLOSE_DELAY_MILLISECONDS) * 100

      setRemainingPercentage(nextPercentage)

      if (remainingMilliseconds === 0) {
        clearInterval(progressInterval)
        closeConfirmationReference.current()
      }
    }, PROGRESS_REFRESH_INTERVAL_MILLISECONDS)

    return () => {
      clearInterval(progressInterval)
    }
  }, [])

  const attendeeName = attendee.user.name ?? attendee.user.username

  return (
    <AlertDialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <AlertDialogContent size="sm" onOutsideClick={onClose} className="sm:p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconCheck className="size-7 shrink-0 text-green-700 dark:text-green-200" />
            <AlertDialogTitle>Oppmøte registrert</AlertDialogTitle>
          </div>

          <div role="timer" aria-label="Lukkes automatisk" className="flex shrink-0">
            <RadialProgress
              percentage={remainingPercentage}
              size={16}
              strokeWidth={3}
              reverse
              hideText
              progressCircleClassname="text-gray-500 dark:text-stone-400"
            />
          </div>
        </div>

        <Text className="text-lg font-medium">{attendeeName}</Text>

        {children}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StatusRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 [&>svg]:size-5">{icon}</span>
      <Text>{children}</Text>
    </div>
  )
}

function RegistrationStatus({ attendance, attendee }: { attendance: Attendance; attendee: Attendee }) {
  if (attendee.registered) {
    return <StatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>Påmeldt</StatusRow>
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)
  const queueLabel = queuePosition === null ? "I køen" : `${queuePosition}. i køen`

  return (
    <StatusRow icon={<IconCircleDashedCheck className="text-indigo-700 dark:text-indigo-200" />}>
      {queueLabel}
    </StatusRow>
  )
}

function PaymentStatus({ price, hasPaid }: { price: number | null; hasPaid: boolean }) {
  if (price === null || price <= 0) {
    return null
  }

  if (hasPaid) {
    return <StatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>{price} kr betalt</StatusRow>
  }

  return <StatusRow icon={<IconX className="text-red-700 dark:text-red-200" />}>{price} kr ubetalt</StatusRow>
}

function CheckInResult({ checkIn }: { checkIn: QrCodeCheckIn }) {
  const { status, attendedAt } = checkIn

  if (status === "registering" || status === "undoing") {
    const pendingMessage = status === "registering" ? "Registrerer oppmøte …" : "Angrer oppmøte …"

    return (
      <div role="status">
        <StatusRow icon={<IconLoader2 className="animate-spin" />}>{pendingMessage}</StatusRow>
      </div>
    )
  }

  if (status === "registration-failed" || status === "undo-failed") {
    const errorMessage =
      status === "registration-failed"
        ? "Kunne ikke registrere oppmøte. Prøv igjen."
        : "Kunne ikke angre. Oppmøtet er fortsatt registrert."

    return (
      <div role="alert">
        <StatusRow icon={<IconX className="text-red-700 dark:text-red-200" />}>{errorMessage}</StatusRow>
      </div>
    )
  }

  if (status === "undone") {
    return (
      <div role="status">
        <StatusRow icon={<IconArrowBackUp />}>Oppmøte angret</StatusRow>
      </div>
    )
  }

  const hasSavedAttendance = status === "registered" || status === "already-attended"

  if (!hasSavedAttendance || attendedAt === null) {
    return null
  }

  const attendanceMessage = status === "registered" ? "Oppmøte registrert" : "Allerede registrert"
  const attendanceIcon =
    status === "registered" ? (
      <IconCheck className="text-green-700 dark:text-green-200" />
    ) : (
      <IconX className="text-red-700 dark:text-red-200" />
    )
  const relativeAttendanceTime = formatDistanceToNow(attendedAt, { locale: nb, addSuffix: true })
  const formattedAttendanceTime = formatDate(attendedAt, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })

  return (
    <div role="status" className="flex flex-col gap-1">
      <StatusRow icon={attendanceIcon}>{attendanceMessage}</StatusRow>
      <Text className="text-sm text-muted-foreground">
        Registrert {relativeAttendanceTime} ({formattedAttendanceTime})
      </Text>
    </div>
  )
}

type CheckInActionsProps = {
  checkIn: QrCodeCheckIn
  canRegisterAttendance: boolean
  onRegisterAttendance: () => void
  onUndoAttendance: () => void
  onClose: () => void
}

function CheckInActions({
  checkIn,
  canRegisterAttendance,
  onRegisterAttendance,
  onUndoAttendance,
  onClose,
}: CheckInActionsProps) {
  const canUndoAttendance = checkIn.status === "registered" || checkIn.status === "undo-failed"

  if (canUndoAttendance) {
    const undoLabel = checkIn.status === "undo-failed" ? "Prøv å angre igjen" : "Angre"

    return (
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="default" color="red" onClick={onUndoAttendance}>
          {undoLabel}
        </Button>

        <Button type="button" variant="default" color="gray" onClick={onClose}>
          Lukk
        </Button>
      </div>
    )
  }

  if (checkIn.status === "registration-failed" && canRegisterAttendance) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Lukk
        </Button>

        <Button type="button" variant="default" color="red" onClick={onRegisterAttendance}>
          Prøv igjen
        </Button>
      </div>
    )
  }

  const needsConfirmation = checkIn.status === "confirmation-required" && canRegisterAttendance

  if (needsConfirmation) {
    return (
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Ønsker du å registrere oppmøte likevel?</Text>

        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Nei
          </Button>

          <AttendanceConfirmationButton onConfirm={onRegisterAttendance} />
        </div>
      </div>
    )
  }

  const isPending = checkIn.status === "registering" || checkIn.status === "undoing"

  return (
    <Button type="button" variant="default" disabled={isPending} onClick={onClose}>
      Neste
    </Button>
  )
}

function AttendanceConfirmationButton({ onConfirm }: { onConfirm: () => void }) {
  const [remainingSeconds, setRemainingSeconds] = useState(3)

  useEffect(() => {
    const unlockAt = Date.now() + 3_000

    const countdownInterval = setInterval(() => {
      const secondsRemaining = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1_000))
      setRemainingSeconds(secondsRemaining)

      if (secondsRemaining === 0) {
        clearInterval(countdownInterval)
      }
    }, 1_000)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [])

  const isDisabled = remainingSeconds > 0
  const confirmationLabel = isDisabled ? `Ja (${remainingSeconds})` : "Ja"

  const handleConfirm = () => {
    if (isDisabled) {
      return
    }

    onConfirm()
  }

  return (
    <Button type="button" variant="default" color="red" disabled={isDisabled} onClick={handleConfirm}>
      <span aria-live="polite">{confirmationLabel}</span>
    </Button>
  )
}
