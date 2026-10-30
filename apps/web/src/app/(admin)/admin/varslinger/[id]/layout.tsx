"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { canManageNotification } from "@dotkomonline/rpc/notification-permissions"
import { getNotificationLinkTypeLabel } from "@dotkomonline/rpc/notification"
import { Button, Text } from "@dotkomonline/ui"
import { IconCheck, IconFileText, IconUsers } from "@tabler/icons-react"
import Link from "next/link"
import { type PropsWithChildren, use } from "react"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationCreatedByQuery, useNotificationGetQuery, useNotificationRecipientStatsQuery } from "../queries"
import { SendNotificationDraftButton } from "../components/SendNotificationDraftButton"
import { NotificationDetailsProvider } from "./provider"
import {
  getActorGroupLabel,
  getCreatedByName,
  getNotificationLinkActionLabel,
  getNotificationLinkHref,
  formatDeleteConfirmText,
  formatSentAt,
} from "./utils"

export default function NotificationDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const authorization = useAuthorization()
  const { data: notification, isLoading, isError, error } = useNotificationGetQuery(id)
  const canManage = notification !== undefined ? canManageNotification(authorization, notification.actorGroup) : false

  useBreadcrumbLabel(breadcrumbPath("varslinger", id), notification?.title ?? null)
  useBreadcrumbLabel(breadcrumbPath("varslinger", id, "mottakere"), "Mottakere")

  const statsQuery = useNotificationRecipientStatsQuery(id, canManage && notification?.status === "SENT")
  const deleteNotification = useDeleteNotificationMutation()

  const { data: createdBy, isLoading: isCreatedByLoading } = useNotificationCreatedByQuery(notification?.createdById)

  if (isLoading) {
    return null
  }

  if (isError || !notification) {
    return (
      <ResourceDetailError
        backHref="/admin/varslinger"
        title="Feil ved henting av varsling"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const actorGroupLabel = getActorGroupLabel(notification.actorGroup)
  const createdByName = getCreatedByName(notification.createdById, createdBy?.name, isCreatedByLoading)
  const isDraft = notification.status === "DRAFT"
  const notificationDate = notification.sentAt ?? notification.createdAt

  const linkLabel = notification.link.type === "NONE" ? null : getNotificationLinkTypeLabel(notification.link.type)
  const linkHref = notification.link.type === "NONE" ? null : getNotificationLinkHref(notification.link)
  const basePath = `/admin/varslinger/${notification.id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Innhold",
      icon: IconFileText,
    },
    {
      href: `${basePath}/mottakere`,
      label: "Mottakere",
      icon: IconUsers,
    },
  ]

  return (
    <NotificationDetailsProvider key={notification.id} notification={notification}>
      <ResourceDetailLayout
        title={notification.title}
        copyIds={[{ value: notification.id }]}
        backHref="/admin/varslinger"
        navItems={navItems}
        headerActions={{
          left: linkHref !== null && (
            <Button
              variant="outline"
              element={Link}
              href={linkHref}
              target={notification.link.type === "URL" ? "_blank" : undefined}
              rel={notification.link.type === "URL" ? "noopener noreferrer" : undefined}
            >
              {getNotificationLinkActionLabel(notification.link.type)}
            </Button>
          ),
          right: isDraft ? (
            <SendNotificationDraftButton />
          ) : (
            <div className="flex items-center gap-1.5 p-2 bg-green-50 dark:bg-green-900/33 rounded-lg">
              <IconCheck className="size-5 text-green-600 dark:text-green-400" aria-hidden />
              <Text className="text-sm font-medium">Varslingen er sendt</Text>
            </div>
          ),
        }}
        onDelete={() => deleteNotification.mutate(notification.id)}
        deleteConfirmTitle={
          isDraft ? "Er du sikker på at du vil slette utkastet?" : formatDeleteConfirmText(statsQuery.data?.totalCount)
        }
        description={
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-muted-foreground">
              {isDraft ? "Utkast opprettet" : "Varsling sendt"} {formatSentAt(notificationDate)} som {actorGroupLabel}{" "}
              av {createdByName}
            </Text>

            {linkHref === null && linkLabel !== null && (
              <Text className="text-sm text-muted-foreground">{linkLabel}</Text>
            )}
          </div>
        }
        readOnlyNotice={
          canManage
            ? undefined
            : {
                title: "Du kan ikke redigere varslingen.",
                message: "Dette er fordi du ikke er avsender. Kontakt dotkom dersom du mener dette er en feil.",
              }
        }
        missingDeletePermission={canManage ? undefined : true}
      >
        {children}
      </ResourceDetailLayout>
    </NotificationDetailsProvider>
  )
}
