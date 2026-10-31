"use client"

import { useNotifyAttendeesMutation } from "@admin/arrangementer/mutations"
import { useEventWithAttendancesGetQuery } from "@admin/arrangementer/queries"
import { useAuthorization } from "@admin/auth/authorization-context"
import { hasCompleteNotificationMessage } from "@dotkomonline/rpc/notification"
import { canSendNotification } from "@dotkomonline/rpc/notification-permissions"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  Checkbox,
  Label,
  Text,
  Title,
} from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import { useId, useState } from "react"
import { useNotificationDetailsContext } from "../[id]/provider"
import { getActorGroupLabel } from "../[id]/utils"
import { useSendNotificationDraftMutation } from "../mutations"
import { useRecipientSelectionPreview } from "../queries"

export function NotificationDraftSend() {
  const { notification, hasUnsavedRecipients, hasUnsavedContent } = useNotificationDetailsContext()
  const authorization = useAuthorization()
  const canSend = canSendNotification(authorization, notification)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [sendEmail, setSendEmail] = useState(false)
  const sendDisabledReasonId = useId()
  const sendDraft = useSendNotificationDraftMutation()
  const notifyAttendees = useNotifyAttendeesMutation()

  const recipientPreview = useRecipientSelectionPreview(notification.draftRecipientSelection, notification.type)
  const recipientCount = recipientPreview.preview?.recipientCount ?? 0
  const hasCompleteContent = hasCompleteNotificationMessage(notification)
  const isSending = sendDraft.isPending || notifyAttendees.isPending

  let sendDisabledReason: string | null = null

  if (isSending) {
    sendDisabledReason = "Sender varslingen…"
  } else if (!canSend) {
    sendDisabledReason = "Du har ikke tilgang til å sende denne varslingen."
  } else if (hasUnsavedContent) {
    sendDisabledReason = "Lagre endringene før du sender."
  } else if (hasUnsavedRecipients) {
    sendDisabledReason = "Lagre mottakerne før du sender."
  } else if (!hasCompleteContent) {
    sendDisabledReason = "Fyll ut tittel og kort beskrivelse i Innhold-fanen før du sender."
  } else if (notification.draftRecipientSelection === null) {
    sendDisabledReason = "Velg og lagre mottakere i Mottakere-fanen før du sender."
  } else if (recipientPreview.isPending) {
    sendDisabledReason = "Sjekker mottakere…"
  } else if (recipientPreview.isForbidden) {
    sendDisabledReason = "Du har ikke tilgang til å sende til de valgte mottakerne."
  } else if (recipientPreview.isError) {
    sendDisabledReason = "Kunne ikke laste mottakerne. Prøv igjen."
  } else if (recipientCount === 0) {
    sendDisabledReason = "Ingen mottakere samsvarer med mottakerreglene."
  }

  const canSendDraft = sendDisabledReason === null
  let recipientSummary = "Ingen mottakere valgt"

  if (notification.draftRecipientSelection !== null) {
    if (recipientPreview.isPending) {
      recipientSummary = "Sjekker mottakere…"
    } else if (recipientPreview.isForbidden || recipientPreview.isError) {
      recipientSummary = "Mottakerlisten er ikke tilgjengelig"
    } else {
      recipientSummary = `${recipientCount} mottakere`
    }
  }

  const eventId = notification.link.type === "EVENT" ? notification.link.eventId : ""
  const eventQuery = useEventWithAttendancesGetQuery(eventId, isConfirmOpen && eventId.length > 0)
  const eventAttendance = eventQuery.data?.attendance
  const hasEmailOption = eventAttendance !== undefined && eventAttendance !== null

  const confirmSend = async () => {
    if (!canSendDraft || isSending) {
      return
    }

    try {
      await sendDraft.mutateAsync({ id: notification.id, expectedUpdatedAt: notification.updatedAt })
    } catch {
      return
    }

    // Publication succeeded. An optional email failure must not invite a second publication.
    setIsConfirmOpen(false)

    if (sendEmail && hasEmailOption) {
      const plainContent = richTextToPlainText(notification.content, null).trim()
      const emailMessage = plainContent || notification.shortDescription

      try {
        await notifyAttendees.mutateAsync({ eventId, message: emailMessage })
      } catch {
        // The email mutation reports its own error; the in-app notification remains sent.
        return
      }
    }
  }

  return (
    <>
      <section className="flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Title element="h2" size="md">
            Send varsling
          </Title>
          <Text className="text-sm text-muted-foreground">
            Se over oppsummeringen før du sender. Ingen blir varslet før du bekrefter sendingen.
          </Text>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <dt className="text-muted-foreground">Tittel</dt>
            <dd className="break-words font-medium">{notification.title || "Tittel mangler"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Avsender</dt>
            <dd className="font-medium">{getActorGroupLabel(notification.actorGroup)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Mottakere</dt>
            <dd className="font-medium">{recipientSummary}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Text id={sendDisabledReasonId} className="text-sm text-muted-foreground" aria-live="polite">
            {sendDisabledReason ?? "Alt er klart for sending."}
          </Text>
          <Button
            variant="default"
            className="w-full shrink-0 sm:w-auto"
            disabled={!canSendDraft}
            onClick={() => setIsConfirmOpen(true)}
            title={sendDisabledReason ?? undefined}
            aria-describedby={sendDisabledReason === null ? undefined : sendDisabledReasonId}
          >
            Send varsling
          </Button>
        </div>
      </section>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent size="md">
          <AlertDialogTitle>Send varsling?</AlertDialogTitle>
          <AlertDialogDescription>
            «{notification.title}» sendes til {recipientCount} mottakere. Mottakerlisten oppdateres ved sending.
          </AlertDialogDescription>
          {hasEmailOption && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="send-draft-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked === true)}
                disabled={isSending}
              />
              <Label htmlFor="send-draft-email">Send også e-post til alle påmeldte på arrangementet</Label>
            </div>
          )}
          {sendDisabledReason !== null && <Text className="text-sm">{sendDisabledReason}</Text>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Avbryt</AlertDialogCancel>
            <Button disabled={!canSendDraft || eventQuery.isLoading} onClick={confirmSend}>
              Send varsling
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
