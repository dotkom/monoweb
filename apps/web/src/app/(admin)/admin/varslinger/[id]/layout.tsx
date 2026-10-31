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
import { Badge, Button, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconCheck, IconFileText, IconSend, IconUsers } from "@tabler/icons-react"
import Link from "next/link"
import { type PropsWithChildren, use } from "react"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationCreatedByQuery, useNotificationGetQuery, useNotificationRecipientStatsQuery } from "../queries"
import { NotificationDetailsProvider } from "./provider"
import {
  getActorGroupLabel,
  getCreatedByName,
  getNotificationLinkActionLabel,
  getNotificationLinkHref,
  formatDeleteConfirmText,
} from "./utils"
import { formatDate, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import { capitalizeFirstLetter } from "@dotkomonline/utils"

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
  useBreadcrumbLabel(breadcrumbPath("varslinger", id, "send"), notification?.status === "SENT" ? "Status" : "Send")

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
  const notificationDateString = formatDate(notificationDate, isThisYear(notificationDate) ? "d. MMM" : "d. MMM yyyy", {
    locale: nb,
  })

  const notificationLongDateString = capitalizeFirstLetter(
    formatDate(notificationDate, "EEEE dd. MMMM yyyy 'kl.' HH:mm", {
      locale: nb,
    })
  )

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
    {
      href: `${basePath}/send`,
      label: isDraft ? "Send" : "Status",
      icon: isDraft ? IconSend : IconCheck,
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
        }}
        onDelete={() => deleteNotification.mutate(notification.id)}
        deleteConfirmTitle={
          isDraft ? "Er du sikker på at du vil slette utkastet?" : formatDeleteConfirmText(statsQuery.data?.totalCount)
        }
        description={
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Badge variant="secondary" color={isDraft ? "red" : "green"} className="border-none">
                {isDraft ? "Utkast" : "Sendt"}
              </Badge>

              <span className="size-1.25 rounded-full bg-border" aria-hidden />

              <Tooltip>
                <TooltipTrigger delay={0}>
                  <Text className="text-sm text-muted-foreground">
                    {isDraft && "Opprettet "}
                    {notificationDateString}
                  </Text>
                </TooltipTrigger>
                <TooltipContent>{notificationLongDateString}</TooltipContent>
              </Tooltip>

              <span className="size-1.25 rounded-full bg-border" aria-hidden />

              <Text className="text-sm text-muted-foreground">
                Som {actorGroupLabel} av {createdByName}
              </Text>
            </div>

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
