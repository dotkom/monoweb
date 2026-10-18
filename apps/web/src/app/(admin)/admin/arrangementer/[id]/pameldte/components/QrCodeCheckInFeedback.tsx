"use client"

import { type Attendance, type Attendee, getAttendeeQueuePosition } from "@dotkomonline/rpc/attendance"
import { Dialog, DialogContent, DialogTitle, Text, Title, cn } from "@dotkomonline/ui"
import { IconArrowBackUp, IconCheck, IconCircleDashedCheck, IconLoader2, IconX } from "@tabler/icons-react"
import { formatDate, formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import type { ReactNode } from "react"
import { CheckInActions } from "./CheckInActions"
import { UserBox } from "./UserBox"
import { type QrCodeCheckIn, getCheckInEligibility, isQrCodeCheckInPending } from "./qr-code-check-in"

type QrCodeCheckInFeedbackProps = {
  attendance: Attendance
  checkIn: QrCodeCheckIn
  onRegisterAttendance: () => void
  onUndoAttendance: () => void
  onClose: () => void
}

export function QrCodeCheckInFeedback({
  attendance,
  checkIn,
  onRegisterAttendance,
  onUndoAttendance,
  onClose,
}: QrCodeCheckInFeedbackProps) {
  const attendee = attendance.attendees.find((attendee) => attendee.id === checkIn.attendeeId)
  const isPending = isQrCodeCheckInPending(checkIn.status)

  const handleClose = () => {
    if (isPending) {
      return
    }

    onClose()
  }

  if (checkIn.isAutomaticCheckIn) {
    return null
  }

  const eligibility = getCheckInEligibility(attendance, attendee)
  const canAttemptRegistration = checkIn.status === "confirmation-required" || checkIn.status === "registration-failed"
  const savedAttendanceTime = attendee?.attendedAt
  const isCheckedInElsewhere = canAttemptRegistration && savedAttendanceTime != null
  const displayedCheckIn: QrCodeCheckIn = isCheckedInElsewhere
    ? { ...checkIn, status: "already-attended", attendedAt: savedAttendanceTime }
    : checkIn

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent className="overflow-y-auto sm:p-3">
        <DialogTitle className="px-2 pt-2 pr-8">QR-kode skannet</DialogTitle>

        <div className="flex flex-col gap-6">
          {attendee === undefined && (
            <div className="flex flex-col gap-2 px-2">
              <StatusRow isHighlighted icon={<IconX className="text-red-700 dark:text-red-400" />}>
                Ingen deltaker funnet
              </StatusRow>
              <Text>Det kan være at QR-koden er til et annet arrangement</Text>
            </div>
          )}

          {attendee !== undefined && (
            <>
              <div className="flex flex-col gap-2">
                <Title element="h3" className="px-2 text-sm font-medium text-muted-foreground">
                  Du har skannet
                </Title>
                <UserBox user={attendee.user} />
              </div>

              <div className="flex flex-col gap-2 px-2">
                <Title element="h3" className="text-sm font-medium text-muted-foreground">
                  Påmeldingsinformasjon
                </Title>
                <RegistrationStatus attendance={attendance} attendee={attendee} />
                <PaymentStatus price={attendance.attendancePrice} hasPaid={eligibility.hasCompletedPayment} />
                {attendance.selections.length > 0 && (
                  <SelectionStatus hasCompletedSelections={eligibility.hasCompletedSelections} />
                )}
              </div>

              {!eligibility.hasRegistrationPool && (
                <div className="flex flex-col gap-2 px-2">
                  <StatusRow isHighlighted icon={<IconX className="text-red-600" />}>
                    Gruppe mangler
                  </StatusRow>
                  <Text>Deltaker ble funnet, men påmeldingsgruppen mangler</Text>
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-3">
            <CheckInResult key={displayedCheckIn.status} checkIn={displayedCheckIn} />
            <CheckInActions
              checkIn={displayedCheckIn}
              canRegisterAttendance={eligibility.canCheckIn}
              onRegisterAttendance={onRegisterAttendance}
              onUndoAttendance={onUndoAttendance}
              onClose={handleClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatusRow({
  icon,
  children,
  isHighlighted = false,
}: {
  icon: ReactNode
  children: ReactNode
  isHighlighted?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-2", isHighlighted && "-mx-2 rounded-lg bg-red-500/10 p-2")}>
      <span className="shrink-0 [&>svg]:size-5">{icon}</span>
      <Text>{children}</Text>
    </div>
  )
}

function RegistrationStatus({ attendance, attendee }: { attendance: Attendance; attendee: Attendee }) {
  if (attendee.registeredAt !== null) {
    return <StatusRow icon={<IconCheck className="text-green-700 dark:text-green-400" />}>Påmeldt</StatusRow>
  }

  const queuePosition = getAttendeeQueuePosition(attendance, attendee.user)
  const queueLabel = queuePosition === null ? "I køen" : `${queuePosition}. i køen`

  return (
    <StatusRow isHighlighted icon={<IconCircleDashedCheck className="text-indigo-700 dark:text-indigo-400" />}>
      {queueLabel}
    </StatusRow>
  )
}

function PaymentStatus({ price, hasPaid }: { price: number | null; hasPaid: boolean }) {
  if (price === null || price <= 0) {
    return null
  }

  if (hasPaid) {
    return <StatusRow icon={<IconCheck className="text-green-700 dark:text-green-400" />}>{price} kr betalt</StatusRow>
  }

  return (
    <StatusRow isHighlighted icon={<IconX className="text-red-700 dark:text-red-400" />}>
      {price} kr ubetalt
    </StatusRow>
  )
}

function SelectionStatus({ hasCompletedSelections }: { hasCompletedSelections: boolean }) {
  const icon = hasCompletedSelections ? (
    <IconCheck className="text-green-700 dark:text-green-400" />
  ) : (
    <IconX className="text-red-700 dark:text-red-400" />
  )

  return (
    <StatusRow isHighlighted={!hasCompletedSelections} icon={icon}>
      {hasCompletedSelections ? "Fullført valg" : "Ikke fullført valg"}
    </StatusRow>
  )
}

function CheckInResult({ checkIn }: { checkIn: QrCodeCheckIn }) {
  const { status, attendedAt } = checkIn

  if (isQrCodeCheckInPending(status)) {
    const pendingMessage = status === "registering" ? "Registrerer oppmøte …" : "Angrer oppmøte …"

    return (
      <div role="status" className="rounded-lg bg-muted p-2">
        <StatusRow icon={<IconLoader2 className="animate-spin" />}>{pendingMessage}</StatusRow>
      </div>
    )
  }

  if (status === "registration-failed" || status === "undo-failed") {
    const errorMessage =
      status === "registration-failed"
        ? "Kunne ikke registrere oppmøte."
        : "Kunne ikke angre. Oppmøtet er fortsatt registrert."

    return (
      <div role="alert" className="rounded-lg bg-muted p-2">
        <StatusRow icon={<IconX className="text-red-700 dark:text-red-400" />}>{errorMessage}</StatusRow>
      </div>
    )
  }

  if (status === "undone") {
    return (
      <div role="status" className="rounded-lg bg-muted p-2">
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
      <IconCheck className="text-green-700 dark:text-green-400" />
    ) : (
      <IconX className="text-red-700 dark:text-red-400" />
    )

  const relativeAttendanceTime = formatDistanceToNow(attendedAt, { locale: nb, addSuffix: true })
  const formattedAttendanceTime = formatDate(attendedAt, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-1 rounded-lg p-2",
        status === "registered" ? "bg-green-50 dark:bg-green-900/15" : "bg-muted",
        "animate-in fade-in slide-in-from-top-[0.125rem] duration-[260ms] ease-smooth motion-reduce:animate-none"
      )}
    >
      <StatusRow icon={attendanceIcon}>{attendanceMessage}</StatusRow>
      <Text className="text-sm text-muted-foreground">
        Registrert {relativeAttendanceTime} ({formattedAttendanceTime})
      </Text>
    </div>
  )
}
