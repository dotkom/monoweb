"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useTRPC } from "@/lib/trpc-client"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { NotificationManagement, NotificationRecipientStats } from "@dotkomonline/rpc/notification"
import {
  Button,
  CloseButton,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { canManageNotification } from "../can-manage-notification"
import { openAddRecipientsModal } from "../components/add-recipients-modal"
import { openEditNotificationModal } from "../components/edit-notification-modal"
import { NotificationLinkAnchor } from "../components/notification-link-anchor"
import { NotificationRecipientsTable } from "../components/notification-recipients-table"
import { NotificationTypeBadge } from "../components/notification-type-badge"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationRecipientStatsQuery, useNotificationRecipientsInfiniteQuery } from "../queries"
import { useNotificationDetailsContext } from "./provider"

function getActorGroupLabel(actorGroup: NotificationManagement["actorGroup"]): string {
  if (actorGroup === null) {
    return "System"
  }

  return getGroupDisplayName(actorGroup)
}

function formatSentAt(date: Date): string {
  return formatDate(date, "d. MMMM yyyy 'kl.' HH:mm", { locale: nb })
}

function formatReadPercentage(stats: NotificationRecipientStats): string {
  if (stats.totalCount === 0) {
    return "0%"
  }

  return `${Math.round((stats.readCount / stats.totalCount) * 100)}%`
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
  const canManage = canManageNotification(notification, { isAdministrator, isGroupMember })
  const deleteNotification = useDeleteNotificationMutation()
  const statsQuery = useNotificationRecipientStatsQuery(notification.id, canManage)
  const {
    recipients,
    isLoading: isRecipientsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
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

  return (
    <Stack>
      <Group>
        <CloseButton onClick={() => router.push("/varslinger")} />
        <NotificationTypeBadge type={notification.type} />
        <Title>{notification.title}</Title>
      </Group>

      <Text size="sm" c="dimmed">
        Sendt {formatSentAt(notification.createdAt)} som {actorGroupLabel} av {createdByName}
      </Text>

      <NotificationLinkAnchor link={notification.link} />

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

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatTile label="Mottakere" isPending={statsQuery.isPending && canManage} value={statsQuery.data?.totalCount} />
        <StatTile
          label="Lest"
          isPending={statsQuery.isPending && canManage}
          value={statsQuery.data?.readCount}
          extra={statsQuery.data === undefined ? undefined : formatReadPercentage(statsQuery.data)}
        />
        <StatTile label="Ulest" isPending={statsQuery.isPending && canManage} value={statsQuery.data?.unreadCount} />
      </SimpleGrid>

      {hasContent && (
        <TypographyStylesProvider>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: notification content is committee-authored HTML */}
          <div dangerouslySetInnerHTML={{ __html: notification.content }} />
        </TypographyStylesProvider>
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
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </Skeleton>
      )}
    </Stack>
  )
}

function getCreatedByName(createdById: string | null, userName: string | null | undefined, isLoading: boolean): string {
  if (createdById === null) {
    return "System"
  }

  if (isLoading) {
    return "…"
  }

  if (userName === undefined || userName === null || userName.length === 0) {
    return "Ukjent"
  }

  return userName
}

function StatTile({
  label,
  value,
  extra,
  isPending,
}: {
  label: string
  value: number | undefined
  extra?: string
  isPending: boolean
}) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {isPending && <Skeleton height={32} width={64} mt="xs" />}
      {!isPending && (
        <Group gap="xs" align="baseline">
          <Title order={3}>{value ?? "—"}</Title>
          {extra !== undefined && (
            <Text size="sm" c="dimmed">
              ({extra})
            </Text>
          )}
        </Group>
      )}
    </Paper>
  )
}
