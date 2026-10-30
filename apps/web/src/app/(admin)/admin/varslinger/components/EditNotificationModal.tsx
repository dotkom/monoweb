"use client"

import type { NotificationManagement } from "@dotkomonline/rpc/notification"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex items-start justify-between gap-3">
          <AlertDialogTitle>Rediger varsling</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>
        {open && (
          <EditNotificationForm
            notification={notification}
            onSuccess={() => onOpenChange(false)}
            className="max-h-[70vh] overflow-y-auto"
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
