"use client"

import type { NotificationManagement } from "@dotkomonline/rpc/notification"
import { Button, DialogBody, Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useRecipientSelectionDraft } from "./recipient-selection/use-recipient-selection-draft"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" onOutsideClick={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle>Send til flere</DialogTitle>
            <DialogClose>
              <IconX className="size-5" />
            </DialogClose>
          </div>
        </DialogHeader>
        <DialogBody>
          {open && <AddRecipientsForm notification={notification} onClose={() => onOpenChange(false)} />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

function AddRecipientsForm({ notification, onClose }: { notification: NotificationManagement; onClose: () => void }) {
  const addRecipients = useAddNotificationRecipientsMutation()
  const { draft, setDraft, recipientSelection, hasIncompleteRules } = useRecipientSelectionDraft(
    notification.initialRecipientSelection
  )

  const {
    preview,
    isPending: isPreviewPending,
    isForbidden,
  } = useRecipientSelectionPreview(recipientSelection, notification.type, {
    notificationId: notification.id,
    hideExistingRecipients: true,
  })

  const recipientCount = preview?.recipientCount ?? 0
  const canSubmit =
    recipientSelection !== null &&
    !hasIncompleteRules &&
    !isPreviewPending &&
    !isForbidden &&
    recipientCount > 0 &&
    !addRecipients.isPending

  const onSubmit = async () => {
    if (!canSubmit || recipientSelection === null) {
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
        value={draft}
        onChange={setDraft}
        type={notification.type}
        notificationId={notification.id}
      />

      <div className="flex justify-end">
        <Button variant="default" onClick={onSubmit} disabled={!canSubmit}>
          Legg til mottakere
        </Button>
      </div>
    </div>
  )
}
