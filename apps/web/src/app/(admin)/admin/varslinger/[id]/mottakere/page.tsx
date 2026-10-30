"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import type { NotificationRecipientFilterQuery } from "@dotkomonline/rpc/notification"
import { Text } from "@dotkomonline/ui"
import { IconMail, IconMailOpened, IconUsers } from "@tabler/icons-react"
import { useState } from "react"
import { AddRecipientsModal } from "../../components/AddRecipientsModal"
import { NotificationRecipientsTable } from "../../components/NotificationRecipientsTable"
import { useNotificationRecipientStatsQuery, useNotificationRecipientsInfiniteQuery } from "../../queries"
import { useNotificationDetailsContext } from "../provider"
import { formatPercent } from "../utils"

export default function NotificationRecipientsPage() {
  const { notification } = useNotificationDetailsContext()
  const authorization = useAuthorization()
  const canManage = canManageNotification(authorization, notification.actorGroup)
  const statsQuery = useNotificationRecipientStatsQuery(notification.id, canManage)
  const [isAddRecipientsOpen, setIsAddRecipientsOpen] = useState(false)
  const [recipientFilters, setRecipientFilters] = useState<NotificationRecipientFilterQuery>({})

  const {
    recipients,
    isLoading: isRecipientsLoading,
    isPlaceholderData: isRecipientsPlaceholderData,
    isFetchingNextPage: isRecipientsFetchingNextPage,
    hasNextPage: isRecipientsHasNextPage,
    fetchNextPage: fetchNextRecipientsPage,
    isError: isRecipientsError,
  } = useNotificationRecipientsInfiniteQuery(notification.id, recipientFilters, canManage)

  return (
    <div className="flex flex-col gap-4">
      {canManage && statsQuery.isPending && <div className="h-4 w-60 animate-pulse rounded-sm bg-muted" />}

      {canManage && statsQuery.isError && (
        <Text className="text-sm text-muted-foreground">Kunne ikke laste mottakerstatistikk.</Text>
      )}

      {canManage && statsQuery.data !== undefined && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <IconUsers size={16} className="text-muted-foreground" />
            <Text className="text-sm">{statsQuery.data.totalCount} mottakere</Text>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <IconMailOpened size={16} className="text-muted-foreground" />
              <Text className="text-sm">
                {formatPercent(statsQuery.data.readCount, statsQuery.data.totalCount)} lest{" "}
                <span className="text-muted-foreground">({statsQuery.data.readCount})</span>
              </Text>
            </div>

            <div className="flex items-center gap-1.5">
              <IconMail size={16} className="text-muted-foreground" />
              <Text className="text-sm">
                {formatPercent(statsQuery.data.unreadCount, statsQuery.data.totalCount)} ulest{" "}
                <span className="text-muted-foreground">({statsQuery.data.unreadCount})</span>
              </Text>
            </div>
          </div>
        </div>
      )}

      {!canManage && <Text className="text-sm text-muted-foreground">Du har ikke tilgang til mottakerlisten.</Text>}

      {canManage && isRecipientsError && (
        <Text className="text-sm text-muted-foreground">Kunne ikke laste mottakere.</Text>
      )}

      {canManage && !isRecipientsError && (
        <NotificationRecipientsTable
          notificationId={notification.id}
          recipients={recipients}
          recipientFilters={recipientFilters}
          setRecipientFilters={setRecipientFilters}
          canManage={canManage}
          onAddRecipients={() => setIsAddRecipientsOpen(true)}
          isLoading={isRecipientsLoading}
          isPlaceholderData={isRecipientsPlaceholderData}
          isFetchingNextPage={isRecipientsFetchingNextPage}
          hasNextPage={isRecipientsHasNextPage}
          fetchNextPage={fetchNextRecipientsPage}
        />
      )}

      <AddRecipientsModal
        open={isAddRecipientsOpen}
        onOpenChange={setIsAddRecipientsOpen}
        notification={notification}
      />
    </div>
  )
}
