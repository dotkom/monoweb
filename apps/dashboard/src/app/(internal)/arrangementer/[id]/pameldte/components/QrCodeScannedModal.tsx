"use client"

import { useIsMobile } from "@/hooks/use-is-mobile"
import {
  type Attendance,
  type AttendeeId,
  getAttendeeQueuePosition,
  getUnreservedAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
  Text,
  Title,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react"
import { formatDate, formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import { useUpdateEventAttendanceMutation } from "../../../mutations"
import { UserBox } from "./UserBox"

export type QRCodeScannedModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance
  attendeeId: AttendeeId
  onClose?: () => void
}

export function QRCodeScannedModal({ open, onOpenChange, attendance, attendeeId, onClose }: QRCodeScannedModalProps) {
  const isMobile = useIsMobile() ?? false
  const registerAttendance = useUpdateEventAttendanceMutation()

  const attendee = attendance.attendees.find((item) => item.id === attendeeId)
  const pool = attendee && attendance.pools.find((item) => item.id === attendee.attendancePoolId)

  const unreservedAttendeeCount = getUnreservedAttendeeCount(attendance)
  const spotInQueue = attendee ? getAttendeeQueuePosition(attendance, attendee.user) : null

  const close = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          onClose?.()
        }
      }}
    >
      <AlertDialogContent size="md" onOutsideClick={close}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>QR-kode skannet</AlertDialogTitle>
          <AlertDialogCancel type="button" onClick={close}>
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {!attendee && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <IconX className="size-7 text-red-600" />
              <Title className="text-base">Ingen deltaker funnet</Title>
            </div>
            <Text>Det kan være at QR-koden er til et annet arrangement</Text>
            <Button type="button" variant="default" onClick={close}>
              Okay
            </Button>
          </div>
        )}

        {attendee && !pool && (
          <div className="flex flex-col gap-4">
            <UserBox user={attendee.user} isMobile={isMobile} />
            <div className="flex items-center gap-1.5">
              <IconX className="size-7 text-red-600" />
              <Title className="text-base">Gruppe mangler</Title>
            </div>
            <Text>Deltaker ble funnet, men påmeldingsgruppen mangler</Text>
            <Button type="button" variant="default" onClick={close}>
              Okay
            </Button>
          </div>
        )}

        {attendee && pool && attendee.attendedAt && (
          <div className="flex flex-col gap-4">
            <UserBox user={attendee.user} isMobile={isMobile} />
            <div className="flex items-center gap-1.5">
              <IconX className="size-7 text-red-600" />
              <Title className="text-base">Allerede registrert</Title>
            </div>
            <div className="flex flex-col gap-1">
              <Text>Deltaker har allerede registrert oppmøte</Text>
              <Text className="text-sm">
                Registrert for {formatDistanceToNow(attendee.attendedAt, { locale: nb, addSuffix: true })} (
                {formatDate(attendee.attendedAt, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })})
              </Text>
            </div>
            <Button type="button" variant="default" onClick={close}>
              Okay
            </Button>
          </div>
        )}

        {attendee && pool && !attendee.attendedAt && (
          <div className="flex flex-col gap-4">
            <UserBox user={attendee.user} isMobile={isMobile} />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {attendee.reserved ? (
                  <>
                    <IconCheck className="size-5 text-green-600" />
                    <Text>Reservert plass</Text>
                  </>
                ) : (
                  <>
                    <IconAlertTriangle className="size-5 text-red-600" />
                    <Text>
                      {spotInQueue}. plass i kø ({unreservedAttendeeCount} totalt i kø)
                    </Text>
                  </>
                )}
              </div>

              {attendance.attendancePrice && (
                <div className="flex items-center gap-1.5">
                  {attendee.paymentChargedAt ? (
                    <>
                      <IconCheck className="size-5 text-green-600" />
                      <Text>Betalt</Text>
                    </>
                  ) : attendee.paymentReservedAt ? (
                    <>
                      <IconCheck className="size-5 text-green-600" />
                      <Text>Reservert betaling</Text>
                    </>
                  ) : (
                    <>
                      <IconAlertTriangle className="size-5 text-red-600" />
                      <Text>Ikke betalt</Text>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Text>Er du sikker på at du vil registrere oppmøte?</Text>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="default"
                  className={isMobile ? "flex-1" : undefined}
                  onClick={() => {
                    registerAttendance.mutate({ id: attendeeId, at: getCurrentUTC() })
                    close()
                  }}
                >
                  Ja
                </Button>
                <Button type="button" variant="secondary" className={isMobile ? "flex-1" : undefined} onClick={close}>
                  Nei
                </Button>
              </div>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
