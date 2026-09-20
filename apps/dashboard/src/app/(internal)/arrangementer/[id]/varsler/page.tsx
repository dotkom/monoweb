"use client"

import { SendNotificationModal } from "@/app/(internal)/varslinger/components/send-notification-modal"
import { NotificationsTable } from "@/app/(internal)/varslinger/components/notifications-table"
import { useNotificationsInfiniteQuery } from "@/app/(internal)/varslinger/queries"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button } from "@dotkomonline/ui"
import { useState } from "react"
import { useEventContext } from "../provider"

export default function EventNotificationsPage() {
  const { event, attendance } = useEventContext()
  const [isSendOpen, setIsSendOpen] = useState(false)
  const { notifications, isLoading, fetchNextPage, hasNextPage } = useNotificationsInfiniteQuery({
    byLink: { type: "EVENT", eventId: event.id },
  })

  const hasAttendance = attendance !== null

  return (
    <div className="flex flex-col gap-4">
      <PermissionTooltip allowed={hasAttendance} label="Arrangementet har ingen påmelding">
        <Button type="button" className="w-fit" disabled={!hasAttendance} onClick={() => setIsSendOpen(true)}>
          Send melding til påmeldte
        </Button>
      </PermissionTooltip>

      {isLoading ? (
        <div className="h-40 w-full animate-pulse rounded-sm bg-muted" />
      ) : (
        <NotificationsTable
          notifications={notifications}
          onLoadMore={hasNextPage ? fetchNextPage : undefined}
          dimReadOnlyRows
        />
      )}

      {attendance !== null && (
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
      )}
    </div>
  )
}
