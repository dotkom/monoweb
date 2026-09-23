"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { useTRPC } from "@/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getNotificationLinkTypeLabel,
  getNotificationTypeLabel,
  type NotificationLink,
  type NotificationManagement,
} from "@dotkomonline/rpc/notification"
import { Button, Separator, Text, TextLink, Title } from "@dotkomonline/ui"
import { IconBell, IconMail, IconMailOpened, IconUsers, IconX } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import DOMPurify from "isomorphic-dompurify"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AddRecipientsModal } from "../components/add-recipients-modal"
import { EditNotificationModal } from "../components/edit-notification-modal"
import { NotificationRecipientsTable } from "../components/notification-recipients-table"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationRecipientStatsQuery, useNotificationRecipientsInfiniteQuery } from "../queries"
import { useNotificationDetailsContext } from "./provider"

function getActorGroupLabel(actorGroup: NotificationManagement["actorGroup"]): string {
  if (actorGroup === null) {
    return "System"
  }

  return getGroupDisplayName(actorGroup)
}

function getCreatedByName(
  createdById: string | null,
  userName: string | null | undefined,
  isUserNameLoading: boolean
): string {
  if (createdById === null) {
    return "System"
  }

  if (isUserNameLoading) {
    return "..."
  }

  if (userName === undefined || userName === null || userName.length === 0) {
    return "Ukjent"
  }

  return userName
}

function getNotificationLinkHref(link: NotificationLink): string | null {
  if (link.type === "NONE") {
    return null
  }

  if (link.type === "URL") {
    return link.url
  }

  if (link.type === "EVENT") {
    return `/arrangementer/${link.eventId}`
  }

  if (link.type === "GROUP") {
    return `/grupper/${link.groupSlug}`
  }

  if (link.type === "USER") {
    return `/brukere/${link.userId}`
  }

  if (link.type === "JOB_LISTING") {
    return `/karriere/${link.jobListingId}`
  }

  if (link.type === "OFFLINE") {
    return "/offline"
  }

  return null
}

function formatSentAt(date: Date): string {
  return formatDate(date, "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })
}

function formatPercent(count: number, total: number): string {
  if (total === 0) {
    return "0 %"
  }

  return `${((count / total) * 100).toFixed(0)} %`
}

function formatDeleteConfirmText(recipientCount: number | undefined): string {
  if (recipientCount === undefined) {
    return "Er du sikker på at du vil slette denne varslingen? Mottakerne vil ikke lenger se den."
  }

  if (recipientCount === 1) {
    return "Er du sikker på at du vil slette denne varslingen? Den er sendt til 1 mottaker, som ikke lenger vil se den."
  }

  return `Er du sikker på at du vil slette denne varslingen? Den er sendt til ${recipientCount} mottakere, som ikke lenger vil se den.`
}

export default function NotificationDetailsPage() {
  const router = useRouter()
  const trpc = useTRPC()
  const { notification } = useNotificationDetailsContext()
  const { canManageNotification } = useAuthorization()
  const canManage = canManageNotification(notification.actorGroupId)
  const deleteNotification = useDeleteNotificationMutation()
  const statsQuery = useNotificationRecipientStatsQuery(notification.id, canManage)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddRecipientsOpen, setIsAddRecipientsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const {
    recipients,
    isLoading: isRecipientsLoading,
    fetchNextPage,
    hasNextPage,
    isError: isRecipientsError,
  } = useNotificationRecipientsInfiniteQuery(notification.id, canManage)

  const createdByQuery = useQuery({
    ...trpc.user.get.queryOptions(notification.createdById ?? ""),
    enabled: notification.createdById !== null,
  })

  const actorGroupLabel = getActorGroupLabel(notification.actorGroup)
  const createdByName = getCreatedByName(notification.createdById, createdByQuery.data?.name, createdByQuery.isLoading)
  const hasContent = notification.content.length > 0
  const sanitizedContent = DOMPurify.sanitize(notification.content)
  const linkLabel = notification.link.type === "NONE" ? null : getNotificationLinkTypeLabel(notification.link.type)
  const linkHref = notification.link.type === "NONE" ? null : getNotificationLinkHref(notification.link)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Tilbake"
          onClick={() => router.push("/varslinger")}
        >
          <IconX className="size-5" />
        </Button>
        <Title>{notification.title}</Title>
      </div>

      <Text className="text-sm text-muted-foreground">
        Sendt {formatSentAt(notification.createdAt)} som {actorGroupLabel} av {createdByName}
      </Text>

      {!canManage && (
        <ReadOnlyNotice
          title="Du kan ikke redigere varslingen."
          message="Dette er fordi du ikke er avsender. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      {linkHref === null && linkLabel !== null && <Text className="text-sm text-muted-foreground">{linkLabel}</Text>}

      {linkHref !== null && notification.link.type === "URL" && (
        <a className="text-sm text-primary underline" href={linkHref} target="_blank" rel="noreferrer">
          {linkLabel}
        </a>
      )}

      {linkHref !== null && notification.link.type !== "URL" && (
        <TextLink href={linkHref} className="text-sm">
          {linkLabel}
        </TextLink>
      )}

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
        <PermissionTooltip allowed={canManage}>
          <Button variant="secondary" onClick={() => setIsEditOpen(true)} disabled={!canManage}>
            Rediger
          </Button>
        </PermissionTooltip>
        <PermissionTooltip allowed={canManage}>
          <Button variant="secondary" onClick={() => setIsAddRecipientsOpen(true)} disabled={!canManage}>
            Send til flere
          </Button>
        </PermissionTooltip>
        <PermissionTooltip allowed={canManage}>
          <Button color="red" variant="secondary" onClick={() => setIsDeleteOpen(true)} disabled={!canManage}>
            Slett
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

      {canManage &&
        !isRecipientsError &&
        (isRecipientsLoading ? (
          <div className="h-40 w-full animate-pulse rounded-sm bg-muted" />
        ) : (
          <NotificationRecipientsTable
            notificationId={notification.id}
            recipients={recipients}
            canManage={canManage}
            onLoadMore={hasNextPage ? fetchNextPage : undefined}
          />
        ))}

      <EditNotificationModal open={isEditOpen} onOpenChange={setIsEditOpen} notification={notification} />
      <AddRecipientsModal
        open={isAddRecipientsOpen}
        onOpenChange={setIsAddRecipientsOpen}
        notification={notification}
      />
      <ConfirmDeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Slett varsling"
        description={formatDeleteConfirmText(statsQuery.data?.totalCount)}
        onConfirm={() => {
          deleteNotification.mutate(notification.id, {
            onSuccess: () => {
              router.push("/varslinger")
            },
          })
        }}
      />
    </div>
  )
}
