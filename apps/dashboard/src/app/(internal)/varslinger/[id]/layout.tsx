"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import { ResourceDetailLayout } from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { getNotificationLinkTypeLabel } from "@dotkomonline/rpc/notification"
import { Text, TextLink } from "@dotkomonline/ui"
import { type PropsWithChildren, use } from "react"
import { useDeleteNotificationMutation } from "../mutations"
import { useNotificationCreatedByQuery, useNotificationGetQuery, useNotificationRecipientStatsQuery } from "../queries"
import { NotificationDetailsContext } from "./provider"
import {
  getActorGroupLabel,
  getCreatedByName,
  getNotificationLinkHref,
  formatDeleteConfirmText,
  formatSentAt,
} from "./utils"

export default function NotificationDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { canManageNotification, isAdministrator } = useAuthorization()
  const { data: notification, isLoading, isError, error } = useNotificationGetQuery(id)
  const canManage = notification ? canManageNotification(notification.actorGroupId) : false

  const statsQuery = useNotificationRecipientStatsQuery(id, canManage)
  const deleteNotification = useDeleteNotificationMutation()

  const { data: createdBy, isLoading: isCreatedByLoading } = useNotificationCreatedByQuery(notification?.createdById)

  if (isLoading) {
    return null
  }

  if (isError || !notification) {
    return (
      <ResourceDetailError
        backHref="/varslinger"
        title="Feil ved henting av varsling"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const actorGroupLabel = getActorGroupLabel(notification.actorGroup)
  const createdByName = getCreatedByName(notification.createdById, createdBy?.name, isCreatedByLoading)

  const linkLabel = notification.link.type === "NONE" ? null : getNotificationLinkTypeLabel(notification.link.type)
  const linkHref = notification.link.type === "NONE" ? null : getNotificationLinkHref(notification.link)

  return (
    <ResourceDetailLayout
      title={notification.title}
      backHref="/varslinger"
      navItems={[]}
      onDelete={() => deleteNotification.mutate(notification.id)}
      deleteConfirmTitle={formatDeleteConfirmText(statsQuery.data?.totalCount)}
      description={
        <div className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">
            Sendt {formatSentAt(notification.createdAt)} som {actorGroupLabel} av {createdByName}
          </Text>

          {linkHref === null && linkLabel !== null && (
            <Text className="text-sm text-muted-foreground">{linkLabel}</Text>
          )}

          {linkHref !== null && notification.link.type === "URL" && (
            <TextLink
              element="a"
              className="text-sm text-foreground w-fit"
              href={linkHref}
              target="_blank"
              rel="noreferrer"
            >
              {linkLabel}
            </TextLink>
          )}

          {linkHref !== null && notification.link.type !== "URL" && (
            <TextLink href={linkHref} className="text-sm text-foreground w-fit">
              {linkLabel}
            </TextLink>
          )}
        </div>
      }
      readOnlyNotice={
        isAdministrator
          ? undefined
          : {
              title: "Du kan ikke redigere varslingen.",
              message: "Dette er fordi du ikke er avsender. Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
      missingDeletePermission={isAdministrator ? undefined : true}
    >
      <NotificationDetailsContext.Provider value={{ notification }}>{children}</NotificationDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
