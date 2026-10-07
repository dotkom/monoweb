"use client"

import type { AttendeeId } from "@dotkomonline/rpc/attendance"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@dotkomonline/ui"
import { useDeregisterForEventMutation } from "../../../mutations"

export type ManualDeleteUserAttendModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendeeId: AttendeeId
  attendeeName: string
  poolName: string
  onSuccess?: () => void
}

export function ManualDeleteUserAttendModal({
  open,
  onOpenChange,
  attendeeId,
  attendeeName,
  onSuccess,
}: ManualDeleteUserAttendModalProps) {
  const { mutate: deregisterAttendee } = useDeregisterForEventMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <AlertDialogTitle>Meld av {attendeeName}</AlertDialogTitle>
        <AlertDialogDescription>Er du sikker på at du vil melde av brukeren?</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" variant="secondary">
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            onClick={() => {
              deregisterAttendee(
                { attendeeId },
                {
                  onSuccess: () => {
                    onSuccess?.()
                    onOpenChange(false)
                  },
                }
              )
            }}
          >
            Meld av bruker
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
