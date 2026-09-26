"use client"

import type { NotificationManagement, NotificationRecipientSelection } from "@dotkomonline/rpc/notification"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, Button } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useState } from "react"
import { useAddNotificationRecipientsMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"
import { RecipientSelectionBuilder } from "./RecipientSelection"

export function AddRecipientsModal({
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
      <AlertDialogContent size="xl" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex items-start justify-between gap-3">
          <AlertDialogTitle>Send til flere</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>
        {open && <AddRecipientsForm notification={notification} onClose={() => onOpenChange(false)} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AddRecipientsForm({ notification, onClose }: { notification: NotificationManagement; onClose: () => void }) {
  const addRecipients = useAddNotificationRecipientsMutation()
  const [recipientSelection, setRecipientSelection] = useState<NotificationRecipientSelection | null>(
    notification.initialRecipientSelection
  )

  const {
    preview,
    isPending: isPreviewPending,
    isForbidden,
  } = useRecipientSelectionPreview(recipientSelection, notification.type)

  const recipientCount = preview?.recipientCount ?? 0
  const canSubmit =
    recipientSelection !== null && !isPreviewPending && !isForbidden && recipientCount > 0 && !addRecipients.isPending

  const onSubmit = async () => {
    if (recipientSelection === null) {
      return
    }

    try {
      await addRecipients.mutateAsync({
        notificationId: notification.id,
        recipientSelection,
      })
    } catch {
      return
    }

    onClose()
  }

  return (
    <div className="flex flex-col gap-4">
      <RecipientSelectionBuilder
        value={recipientSelection}
        onChange={setRecipientSelection}
        type={notification.type}
        countMode="new"
      />

      <div className="flex justify-end">
        <Button variant="default" onClick={onSubmit} disabled={!canSubmit}>
          Legg til mottakere
        </Button>
      </div>
    </div>
  )
}
