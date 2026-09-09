"use client"

import type { NotificationManagement, NotificationRecipientSelection } from "@dotkomonline/rpc/notification"
import { Button, Group, Stack } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { type FC, useState } from "react"
import { useAddNotificationRecipientsMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"
import { RecipientSelectionBuilder } from "./recipient-selection"

export const AddRecipientsModal: FC<ContextModalProps<{ notification: NotificationManagement }>> = ({
  context,
  id,
  innerProps: { notification },
}) => {
  const close = () => context.closeModal(id)
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

    close()
  }

  return (
    <Stack>
      <RecipientSelectionBuilder
        value={recipientSelection}
        onChange={setRecipientSelection}
        type={notification.type}
        countMode="new"
      />

      <Group justify="flex-end">
        <Button onClick={onSubmit} loading={addRecipients.isPending} disabled={!canSubmit}>
          Legg til mottakere
        </Button>
      </Group>
    </Stack>
  )
}

export function openAddRecipientsModal(notification: NotificationManagement) {
  return modals.openContextModal({
    modal: "notification/add-recipients",
    title: "Send til flere",
    size: "xl",
    innerProps: { notification },
  })
}
