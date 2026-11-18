"use client"

import type { NotificationManagement } from "@dotkomonline/rpc/notification"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { EditNotificationForm } from "./EditNotificationForm"

export function EditNotificationModal({
  open,
  onOpenChange,
  notification,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification: NotificationManagement
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex-row flex items-start justify-between gap-3">
          <DialogTitle>Rediger varsling</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          {open && <EditNotificationForm notification={notification} onSuccess={() => onOpenChange(false)} />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
