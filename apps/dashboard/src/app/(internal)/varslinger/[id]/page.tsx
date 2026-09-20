"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useTRPC } from "@/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getNotificationLinkTypeLabel,
  getNotificationTypeLabel,
  type NotificationLink,
  type NotificationManagement,
} from "@dotkomonline/rpc/notification"
import {
  Anchor,
  Button,
  CloseButton,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core"
import { IconBell, IconMail, IconMailOpened, IconUsers } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import DOMPurify from "isomorphic-dompurify"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { openAddRecipientsModal } from "../components/add-recipients-modal"
import { openEditNotificationModal } from "../components/edit-notification-modal"
import { NotificationRecipientsTable } from "../components/notification-recipients-table"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationRecipientStatsQuery, useNotificationRecipientsInfiniteQuery } from "../queries"
import { useNotificationDetailsContext } from "./provider"

function canManageNotification(
  notification: NotificationManagement,
  isAdministrator: boolean,
  isGroupMember: (groupSlug: string) => boolean
): boolean {
  if (notification.actorGroupId === null) {
    return isAdministrator
  }

  return isGroupMember(notification.actorGroupId)
}

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
  const { isAdministrator, isGroupMember } = useAuthorization()
  const canManage = canManageNotification(notification, isAdministrator, isGroupMember)
  const deleteNotification = useDeleteNotificationMutation()
  const statsQuery = useNotificationRecipientStatsQuery(notification.id, canManage)

  const {
    recipients,
    isLoading: isRecipientsLoading,
    fetchNextPage,
    isError: isRecipientsError,
  } = useNotificationRecipientsInfiniteQuery(notification.id, canManage)

  const createdByQuery = useQuery({
    ...trpc.user.get.queryOptions(notification.createdById ?? ""),
    enabled: notification.createdById !== null,
  })

  const openDeleteModal = useConfirmDeleteModal({
    title: "Slett varsling",
    text: formatDeleteConfirmText(statsQuery.data?.totalCount),
    onConfirm: () => {
      deleteNotification.mutate(notification.id, {
        onSuccess: () => {
          router.push("/varslinger")
        },
      })
    },
  })

  const actorGroupLabel = getActorGroupLabel(notification.actorGroup)
  const createdByName = getCreatedByName(notification.createdById, createdByQuery.data?.name, createdByQuery.isLoading)
  const hasContent = notification.content.length > 0
  const sanitizedContent = DOMPurify.sanitize(notification.content)
  const linkLabel = notification.link.type === "NONE" ? null : getNotificationLinkTypeLabel(notification.link.type)
  const linkHref = notification.link.type === "NONE" ? null : getNotificationLinkHref(notification.link)

  return (
    <Stack>
      <Group>
        <CloseButton onClick={() => router.push("/varslinger")} />

        <Title>{notification.title}</Title>
      </Group>

      <Text size="sm" c="dimmed">
        Sendt {formatSentAt(notification.createdAt)} som {actorGroupLabel} av {createdByName}
      </Text>

      {linkHref === null && (
        <Text size="sm" c="dimmed">
          {linkLabel}
        </Text>
      )}

      {linkHref !== null && notification.link.type === "URL" && (
        <Anchor href={linkHref} size="sm" target="_blank" rel="noreferrer">
          {linkLabel}
        </Anchor>
      )}

      {linkHref !== null && notification.link.type !== "URL" && (
        <Anchor component={Link} href={linkHref} size="sm">
          {linkLabel}
        </Anchor>
      )}

      <Stack gap="xs">
        <Group gap={6} wrap="nowrap">
          <IconBell size={16} color="var(--mantine-color-dimmed)" />
          <Text size="sm">{getNotificationTypeLabel(notification.type)}</Text>
        </Group>

        {canManage && statsQuery.isPending && <Skeleton height={16} width={240} />}

        {canManage && !statsQuery.isPending && statsQuery.data !== undefined && (
          <>
            <Group gap={6} wrap="nowrap">
              <IconUsers size={16} color="var(--mantine-color-dimmed)" />
              <Text size="sm">{statsQuery.data.totalCount} mottakere</Text>
            </Group>

            <Group gap="md" wrap="wrap">
              <Group gap={6} wrap="nowrap">
                <IconMailOpened size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm">
                  {statsQuery.data.readCount} lest{" "}
                  <span style={{ color: "var(--mantine-color-dimmed)" }}>
                    ({((statsQuery.data.readCount / statsQuery.data.totalCount) * 100).toFixed(0)} %)
                  </span>
                </Text>
              </Group>

              <Group gap={6} wrap="nowrap">
                <IconMail size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm">
                  {statsQuery.data.unreadCount} ulest{" "}
                  <span style={{ color: "var(--mantine-color-dimmed)" }}>
                    ({((statsQuery.data.unreadCount / statsQuery.data.totalCount) * 100).toFixed(0)} %)
                  </span>
                </Text>
              </Group>
            </Group>
          </>
        )}
      </Stack>

      {canManage && (
        <Group>
          <Button variant="light" onClick={() => openEditNotificationModal(notification)}>
            Rediger
          </Button>
          <Button variant="light" onClick={() => openAddRecipientsModal(notification)}>
            Send til flere
          </Button>
          <Button color="red" variant="light" onClick={openDeleteModal}>
            Slett
          </Button>
        </Group>
      )}

      {hasContent && (
        <>
          <Divider />

          <TypographyStylesProvider>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized */}
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </TypographyStylesProvider>
        </>
      )}

      <Title order={2}>Mottakere</Title>

      {!canManage && (
        <Text size="sm" c="dimmed">
          Du har ikke tilgang til mottakerlisten.
        </Text>
      )}

      {canManage && isRecipientsError && (
        <Text size="sm" c="dimmed">
          Kunne ikke laste mottakere.
        </Text>
      )}

      {canManage && !isRecipientsError && (
        <Skeleton visible={isRecipientsLoading}>
          <NotificationRecipientsTable
            notificationId={notification.id}
            recipients={recipients}
            canManage={canManage}
            onLoadMore={fetchNextPage}
          />
        </Skeleton>
      )}
    </Stack>
  )
}
