"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { getNotificationTypeLabel, type NotificationRecipientFilterQuery } from "@dotkomonline/rpc/notification"
import { Button, Separator, Text, Title } from "@dotkomonline/ui"
import { IconBell, IconMail, IconMailOpened, IconUsers } from "@tabler/icons-react"
import DOMPurify from "isomorphic-dompurify"
import { useState } from "react"
import { AddRecipientsModal } from "../components/AddRecipientsModal"
import { EditNotificationModal } from "../components/EditNotificationModal"
import { NotificationRecipientsTable } from "../components/NotificationRecipientsTable"
import { useNotificationRecipientStatsQuery, useNotificationRecipientsInfiniteQuery } from "../queries"
import { useNotificationDetailsContext } from "./provider"
import { formatPercent } from "./utils"

export default function NotificationDetailsPage() {
  const { notification } = useNotificationDetailsContext()
  const { canManageNotification, isAdministrator } = useAuthorization()
  const canManage = canManageNotification(notification.actorGroupId)
  const statsQuery = useNotificationRecipientStatsQuery(notification.id, canManage)
  const [isEditOpen, setIsEditOpen] = useState(false)
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

  const hasContent = notification.content.length > 0
  const sanitizedContent = DOMPurify.sanitize(notification.content)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <IconBell size={16} className="text-muted-foreground" />
          <Text className="text-sm">{getNotificationTypeLabel(notification.type)}</Text>
        </div>

        {canManage && statsQuery.isPending && <div className="h-4 w-60 animate-pulse rounded-sm bg-muted" />}

        {canManage && !statsQuery.isPending && statsQuery.data !== undefined && (
          <>
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
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <PermissionTooltip allowed={isAdministrator}>
          <Button variant="secondary" onClick={() => setIsEditOpen(true)} disabled={!isAdministrator}>
            Rediger
          </Button>
        </PermissionTooltip>
        <PermissionTooltip allowed={isAdministrator}>
          <Button variant="secondary" onClick={() => setIsAddRecipientsOpen(true)} disabled={!isAdministrator}>
            Send til flere
          </Button>
        </PermissionTooltip>
      </div>

      {hasContent && (
        <>
          <Separator />
          <div
            className="text-sm [&_a]:underline [&_p]:mb-3"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </>
      )}

      <Title element="h2">Mottakere</Title>

      {!canManage && <Text className="text-sm text-muted-foreground">Du har ikke tilgang til mottakerlisten.</Text>}

      {canManage && isRecipientsError && (
        <Text className="text-sm text-muted-foreground">Kunne ikke laste mottakere.</Text>
      )}

      {canManage && !isRecipientsError && (
        <div className="flex flex-col gap-2">
          <NotificationRecipientsTable
            notificationId={notification.id}
            recipients={recipients}
            recipientFilters={recipientFilters}
            setRecipientFilters={setRecipientFilters}
            canManage={isAdministrator}
            isLoading={isRecipientsLoading}
            isPlaceholderData={isRecipientsPlaceholderData}
            isFetchingNextPage={isRecipientsFetchingNextPage}
            hasNextPage={isRecipientsHasNextPage}
            fetchNextPage={fetchNextRecipientsPage}
          />
        </div>
      )}

      <EditNotificationModal open={isEditOpen} onOpenChange={setIsEditOpen} notification={notification} />
      <AddRecipientsModal
        open={isAddRecipientsOpen}
        onOpenChange={setIsAddRecipientsOpen}
        notification={notification}
      />
    </div>
  )
}
