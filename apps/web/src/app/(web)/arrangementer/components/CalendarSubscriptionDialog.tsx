"use client"

import { Dialog, DialogClose, DialogContent } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { CalendarSubscriptionPanel } from "./CalendarSubscriptionPanel"

interface CalendarSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalendarSubscriptionDialog({ open, onOpenChange }: CalendarSubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Arrangementer i kalenderen" className="max-h-[85dvh] overflow-y-auto">
        <CalendarSubscriptionPanel enabled={open} />

        <DialogClose aria-label="Lukk" className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <IconX className="size-[1.25em]" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
