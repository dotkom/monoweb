"use client"

import { NotificationsTable } from "@admin/varslinger/components/NotificationsTable"
import { CreateNotificationDraftModal } from "@admin/varslinger/components/CreateNotificationDraftModal"
import { useNotificationsInfiniteQuery } from "@admin/varslinger/queries"
import { Button, Title } from "@dotkomonline/ui"
import { useState } from "react"
import { useEventContext } from "../provider"
import { useEventEditPermission } from "../../use-event-edit-permission"

export default function EventNotificationsPage() {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const [isSendOpen, setIsSendOpen] = useState(false)
  const { notifications, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useNotificationsInfiniteQuery({
      byLink: { type: "EVENT", eventId: event.id },
    })

  return (
    <div className="flex flex-col gap-4">
      <Title size="md">Varsler</Title>
      <Button
        type="button"
        variant="secondary"
        className="w-fit"
        disabled={!canEdit}
        onClick={() => setIsSendOpen(true)}
      >
        Opprett varsling
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

      <CreateNotificationDraftModal
        open={isSendOpen}
        onOpenChange={setIsSendOpen}
        source={{
          type: "EVENT",
          eventId: event.id,
          eventTitle: event.title,
          hostingGroupSlugs: event.hostingGroups.map((group) => group.slug),
        }}
      />
    </div>
  )
}
