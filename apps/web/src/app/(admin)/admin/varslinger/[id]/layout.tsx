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
import { Text } from "@dotkomonline/ui"
import { IconFileText, IconUsers } from "@tabler/icons-react"
import { type PropsWithChildren, use } from "react"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationCreatedByQuery, useNotificationGetQuery, useNotificationRecipientStatsQuery } from "../queries"
import { NotificationDetailsContext } from "./provider"
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

  const statsQuery = useNotificationRecipientStatsQuery(id, canManage)
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
    <ResourceDetailLayout
      title={notification.title}
      copyIds={[{ value: notification.id }]}
      backHref="/admin/varslinger"
      navItems={navItems}
      viewInWebProps={
        linkHref === null
          ? undefined
          : {
              href: linkHref,
              label: getNotificationLinkActionLabel(notification.link.type),
            }
      }
      onDelete={() => deleteNotification.mutate(notification.id)}
      deleteConfirmTitle={formatDeleteConfirmText(statsQuery.data?.totalCount)}
      description={
        <div className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">
            Varsling sendt {formatSentAt(notification.createdAt)} som {actorGroupLabel} av {createdByName}
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
      <NotificationDetailsContext.Provider value={{ notification }}>{children}</NotificationDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
