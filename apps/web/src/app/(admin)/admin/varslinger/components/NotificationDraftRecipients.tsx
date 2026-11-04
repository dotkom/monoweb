"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import { Button, Text } from "@dotkomonline/ui"
import { useNotificationDetailsContext } from "../[id]/provider"
import { useSaveNotificationDraftRecipientsMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"
import { RecipientSelectionBuilder } from "./RecipientSelection"

export function NotificationDraftRecipients() {
  const {
    notification,
    recipientSelection,
    recipientSelectionDraft,
    setRecipientSelectionDraft,
    hasUnsavedRecipients,
    hasIncompleteRecipientRules,
  } = useNotificationDetailsContext()
  const authorization = useAuthorization()
  const canManage = canManageNotification(authorization, notification.actorGroup)
  const saveRecipients = useSaveNotificationDraftRecipientsMutation()
  const recipientPreview = useRecipientSelectionPreview(recipientSelection, notification.type)

  const saveSelection = () => saveRecipients.mutate({ id: notification.id, recipientSelection })

  if (!canManage) {
    return <Text className="text-sm text-muted-foreground">Du har ikke tilgang til å velge mottakere.</Text>
  }

  return (
    <div className="flex flex-col gap-4">
      <Text className="text-sm text-muted-foreground">
        Mottakerreglene lagres i utkastet. Ingen blir varslet før du sender.
      </Text>
      <RecipientSelectionBuilder
        value={recipientSelectionDraft}
        onChange={setRecipientSelectionDraft}
        type={notification.type}
      />

      {hasIncompleteRecipientRules && (
        <Text className="text-sm text-muted-foreground">
          Fullfør eller fjern uferdige mottakerregler før du lagrer.
        </Text>
      )}
      <Button
        className="w-fit"
        variant="secondary"
        onClick={saveSelection}
        disabled={
          !hasUnsavedRecipients ||
          hasIncompleteRecipientRules ||
          saveRecipients.isPending ||
          recipientPreview.isForbidden
        }
      >
        Lagre mottakere
      </Button>
    </div>
  )
}
