import { Button } from "@dotkomonline/ui"
import { type QrCodeCheckIn, isQrCodeCheckInPending } from "./qr-code-check-in"

type CheckInActionsProps = {
  checkIn: QrCodeCheckIn
  canRegisterAttendance: boolean
  onRegisterAttendance: () => void
  onUndoAttendance: () => void
  onClose: () => void
}

export function CheckInActions({
  checkIn,
  canRegisterAttendance,
  onRegisterAttendance,
  onUndoAttendance,
  onClose,
}: CheckInActionsProps) {
  const isConfirmationRequired = checkIn.status === "confirmation-required" && canRegisterAttendance
  const canUndoAttendance = checkIn.status === "registered"

  if (isConfirmationRequired || canUndoAttendance) {
    const secondaryAction = isConfirmationRequired ? onClose : onUndoAttendance
    const primaryAction = isConfirmationRequired ? onRegisterAttendance : onClose

    return (
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" color="gray" onClick={secondaryAction} className="min-h-12">
          {isConfirmationRequired ? "Avbryt" : "Angre"}
        </Button>

        <Button type="button" variant="default" onClick={primaryAction} className="min-h-12">
          {isConfirmationRequired ? "Registrer likevel" : "Neste"}
        </Button>
      </div>
    )
  }

  const isPending = isQrCodeCheckInPending(checkIn.status)
  const hasFailed = checkIn.status === "registration-failed" || checkIn.status === "undo-failed"

  return (
    <Button type="button" variant="default" disabled={isPending} onClick={onClose} className="min-h-12">
      {hasFailed ? "Lukk" : "Neste"}
    </Button>
  )
}
