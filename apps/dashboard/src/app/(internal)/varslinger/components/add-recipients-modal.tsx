"use client"

import type { NotificationAudience, NotificationManagement } from "@dotkomonline/rpc/notification"
import { Button, Group, Stack } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { type FC, useState } from "react"
import { useAudiencePreview } from "../hooks/use-audience-preview"
import { useAddNotificationRecipientsMutation } from "../mutations"
import { AudienceBuilder } from "./audience-builder"

export const AddRecipientsModal: FC<ContextModalProps<{ notification: NotificationManagement }>> = ({
  context,
  id,
  innerProps: { notification },
}) => {
  const close = () => context.closeModal(id)
  const addRecipients = useAddNotificationRecipientsMutation()
  const [audience, setAudience] = useState<NotificationAudience | null>(notification.audience)
  const { preview, isPending: isPreviewPending, isForbidden } = useAudiencePreview(audience, notification.type)
  const recipientCount = preview?.recipientCount ?? 0
  const canSubmit =
    audience !== null && !isPreviewPending && !isForbidden && recipientCount > 0 && !addRecipients.isPending

  const onSubmit = async () => {
    if (audience === null) {
      return
    }

    try {
      await addRecipients.mutateAsync({
        notificationId: notification.id,
        audience,
      })
    } catch {
      return
    }

    close()
  }

  return (
    <Stack>
      <AudienceBuilder value={audience} onChange={setAudience} type={notification.type} countMode="new" />

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
