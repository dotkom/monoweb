"use client"

import type { AttendeeId } from "@dotkomonline/rpc/attendance"
import {
  DialogBody,
  Dialog,
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogTitle>Meld av {attendeeName}</DialogTitle>
        <DialogBody>
          <DialogDescription>Er du sikker på at du vil melde av brukeren?</DialogDescription>
        </DialogBody>
        <DialogFooter className="-mx-5 -mb-5 rounded-b-2xl p-5 sm:-mx-6 sm:-mb-6 sm:p-6">
          <DialogClose type="button" variant="secondary">
            Avbryt
          </DialogClose>
          <Button
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
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
