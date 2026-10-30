"use client"

import type { NotificationRecipientSelection, NotificationType } from "@dotkomonline/rpc/notification"
import { Button, Text, TextInput } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useRecipientSelectionPreviewInfinite } from "../../queries"
import { PersonAvatar } from "./RecipientIdentity"
import { LabeledToggle } from "./RecipientSelectionControls"
import type { ExcludedRecipient } from "./recipient-selection-draft"

export function RecipientPreview({
  recipientSelection,
  ruleNumbers,
  notificationType,
  notificationId,
  onExclude,
}: {
  recipientSelection: NotificationRecipientSelection | null
  ruleNumbers: number[]
  notificationType: NotificationType
  notificationId?: string
  onExclude: (recipient: ExcludedRecipient) => void
}) {
  const [recipientSearch, setRecipientSearch] = useState("")
  const [hideExistingRecipients, setHideExistingRecipients] = useState(true)
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null)

  const { preview, recipients, isPending, isForbidden, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRecipientSelectionPreviewInfinite(recipientSelection, notificationType, recipientSearch, {
      notificationId,
      hideExistingRecipients: notificationId !== undefined && hideExistingRecipients,
    })

  const isLoadingInitialPreview = isPending && preview === undefined
  const hasNoMatches = !isError && !isPending && preview !== undefined && recipients.length === 0
  const hasRecipients = recipients.length > 0

  useEffect(() => {
    if (loadMoreNode === null) {
      return
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        return
      }

      if (!hasNextPage) {
        return
      }

      if (isFetchingNextPage) {
        return
      }

      void fetchNextPage()
    })

    intersectionObserver.observe(loadMoreNode)

    return () => intersectionObserver.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, loadMoreNode])

  const recipientCount = isForbidden ? 0 : (preview?.recipientCount ?? 0)
  let recipientCountTitle = `${recipientCount} personer blir mottakere`

  if (notificationId !== undefined) {
    recipientCountTitle = hideExistingRecipients
      ? `${recipientCount} nye mottakere`
      : `${recipientCount} personer i utvalget`
  }

  if (recipientSelection === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {isLoadingInitialPreview && <div className="h-9 w-20 animate-pulse rounded-sm bg-muted" />}

      {preview !== undefined && <Text className="text-sm font-medium">{recipientCountTitle}</Text>}

      {isForbidden && <Text className="text-sm text-red-600">Du kan ikke sende til disse mottakerne</Text>}

      {isError && !isForbidden && (
        <Text className="text-sm text-red-600">Kunne ikke laste mottakerne. Prøv igjen.</Text>
      )}

      {!isForbidden && !isError && (
        <div className="flex flex-col gap-2">
          {notificationId !== undefined && (
            <LabeledToggle
              label="Skjul eksisterende mottakere"
              checked={hideExistingRecipients}
              onCheckedChange={setHideExistingRecipients}
            />
          )}
          <TextInput
            placeholder="Søk etter navn"
            value={recipientSearch}
            onChange={(event) => setRecipientSearch(event.currentTarget.value)}
          />

          {isLoadingInitialPreview && <div className="h-20 animate-pulse rounded-sm bg-muted" />}

          {hasNoMatches && <Text className="text-sm text-muted-foreground">Ingen treff</Text>}

          {hasRecipients && (
            <div className="flex max-h-50 flex-col gap-2 overflow-auto">
              {recipients.map((recipient) => {
                const matchingRuleNumbers = recipient.sourceRuleIndexes
                  .map((ruleIndex) => ruleNumbers[ruleIndex])
                  .filter((ruleNumber) => ruleNumber !== undefined)

                const sourceSummary = isPending
                  ? ""
                  : matchingRuleNumbers.map((ruleNumber) => `#${ruleNumber}`).join(", ")

                const excludeCurrentRecipient = () => {
                  const excludedRecipient = {
                    userId: recipient.userId,
                    name: recipient.name,
                    imageUrl: recipient.imageUrl,
                  }

                  onExclude(excludedRecipient)
                }

                return (
                  <div
                    key={recipient.userId}
                    style={{
                      borderTopLeftRadius: "calc(var(--spacing) * 5)",
                      borderBottomLeftRadius: "calc(var(--spacing) * 5)",
                    }}
                    className="flex items-center justify-between gap-2 border border-field-border bg-muted/50 p-1.5 h-10 rounded-r-lg"
                  >
                    <div className="flex items-center gap-2">
                      <PersonAvatar name={recipient.name} imageUrl={recipient.imageUrl} />
                      <Text className="text-sm">{recipient.name ?? "Ukjent"}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      {recipient.isExistingRecipient && (
                        <span className="text-xs text-muted-foreground">Allerede mottaker</span>
                      )}
                      <span className="font-mono text-xs text-muted-foreground">{sourceSummary}</span>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        color="red"
                        aria-label="Ekskluder"
                        disabled={isPending}
                        onClick={excludeCurrentRecipient}
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
              {hasNextPage && <div ref={setLoadMoreNode} className="h-px" />}
              {isFetchingNextPage && <div className="h-4 animate-pulse rounded-sm bg-muted" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
