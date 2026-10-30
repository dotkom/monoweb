"use client"

import { NotificationsTable } from "@admin/varslinger/components/NotificationsTable"
import { SendNotificationModal } from "@admin/varslinger/components/SendNotificationModal"
import { useNotificationsInfiniteQuery } from "@admin/varslinger/queries"
import { Button, Text, Title } from "@dotkomonline/ui"
import { useState } from "react"
import { useEventContext } from "../provider"
import { useEventEditPermission } from "../../use-event-edit-permission"

export default function EventNotificationsPage() {
  const { event, attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const [isSendOpen, setIsSendOpen] = useState(false)
  const { notifications, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotificationsInfiniteQuery({
      byLink: { type: "EVENT", eventId: event.id },
    })

  if (!attendance) {
    return <Text>Du må legge til en påmelding før du kan sende varsler til påmeldte.</Text>
  }

  return (
    <div className="flex flex-col gap-4">
      <Title size="md">Varsler</Title>
      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        disabled={!canEdit || attendance.attendees.length === 0}
        onClick={() => setIsSendOpen(true)}
      >
        Send melding til påmeldte
      </Button>

      <NotificationsTable
        notifications={notifications}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
        dimReadOnlyRows
      />

      <SendNotificationModal
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        source={{
          kind: "EVENT",
          eventId: event.id,
          attendanceId: attendance.id,
          eventTitle: event.title,
          hostingGroupSlugs: event.hostingGroups.map((group) => group.slug),
          hasPayment: attendance.attendancePrice !== null,
          selections: attendance.selections,
        }}
      />
    </div>
  )
}
